import {Closeable} from "../Closeable";
import {LinkOption} from "./LinkOption";
import {Path} from "./Path";
import {DirectoryStream} from "./DirectoryStream";
import {BasicFileAttributes, BasicFileAttributesHolder} from "./attribute";
import {IllegalArgumentException, IOException, SecurityException} from "../exception";
import {FileVisitOption} from "./FileVisitOption";
import {Objects} from "../utils";
import {Files} from "./Files";
import {DirectoryIteratorException, FileSystemLoopException} from "./exception";

/* It walks a file tree, and returns events for each file it encounters */
export class FileTreeWalker implements Closeable {
    private readonly followLinks: boolean;
    private readonly linkOptions: LinkOption[];
    private readonly maxDepth: number;
    private readonly stack: DirectoryNode[] = [];
    private closed = false;

    constructor(options: FileVisitOption[], maxDepth: number) {
        let fl = false;
        for (const option of options) {
            switch (option) {
                case FileVisitOption.FOLLOW_LINKS:
                    fl = true;
                    break;
                default:
                    throw new Error("Should not get here");
            }
        }
        if (maxDepth < 0) {
            throw new IllegalArgumentException("'maxDepth is negative");
        }
        this.followLinks = fl;
        this.linkOptions = (fl) ? [] : [LinkOption.NOFOLLOW_LINKS];
        this.maxDepth = maxDepth;
    }

    /**
     * Returns the attributes of the given file, taking into account whether
     * the walk is following symlinks is not. The {@code canUseCached}
     * argument determines whether this method can use cached attributes.
     */
    private async getAttributes(file: Path, canUseCached: boolean): Promise<BasicFileAttributes> {
        if (canUseCached && "get" in file && "invalidate" in file) {
            const cached = (file as unknown as BasicFileAttributesHolder).get();
            if (Objects.nonNullUndefined(cached) && (!this.followLinks || !cached?.isSymbolicLink())) {
                return cached as BasicFileAttributes;
            }
        }
        // attempt to get attributes of file. If fails, and we are following
        // links then a link target might not exist so get attributes of link
        let attrs: BasicFileAttributes;
        try {
            attrs = await Files.readAttributesByName(file, "basic", this.linkOptions);
        } catch (e) {
            if (!(e instanceof IOException)) {
                throw e;
            }
            if (!this.followLinks) {
                throw e;
            }
            attrs = await Files.readAttributesByName(file, "basic", [LinkOption.NOFOLLOW_LINKS]);
        }
        return attrs;
    }

    private async wouldLoop(dir: Path, key: any): Promise<boolean> {
        for (const ancestor of this.stack) {
            const ancestorKey: any = ancestor.key();
            if (Objects.nonNullUndefined(key) && Objects.nonNullUndefined(ancestorKey)) {
                if (key.valueOf() === ancestorKey.valueOf()) {// TODO check for better equals
                    return true;
                }
            } else {
                try {
                    if (await Files.isSameFile(dir, ancestor.directory())) {
                        return true;
                    }
                } catch (e) {
                    if (!(e instanceof IOException || e instanceof SecurityException)) {
                        throw e;
                    }
                }
            }
        }
        return false;
    }

    private async visit(entry: Path, ignoreSecurityException: boolean, canUseCached: boolean): Promise<FileTreeWalkerEvent | null> {
        let attrs: BasicFileAttributes;
        try {
            attrs = await this.getAttributes(entry, canUseCached);
        } catch (e) {
            if (e instanceof IOException) {
                return new FileTreeWalkerEvent(FileTreeWalkerEventType.ENTRY, entry, undefined, e);
            }
            if (e instanceof SecurityException) {
                if (ignoreSecurityException) {
                    return null;
                }
            }
            throw e;
        }
        // at maximum depth or file is not a directory
        const depth = this.stack.length;
        if (depth >= this.maxDepth || !attrs.isDirectory()) {
            return new FileTreeWalkerEvent(FileTreeWalkerEventType.ENTRY, entry, attrs);
        }

        // check for cycles when following links
        if (this.followLinks && await this.wouldLoop(entry, attrs.fileKey())) {
            return new FileTreeWalkerEvent(FileTreeWalkerEventType.ENTRY, entry, undefined, new FileSystemLoopException(entry.toString()));
        }

        // file is a directory, attempt to open it
        let stream: DirectoryStream<Path>;
        try {
            stream = await Files.newDirectoryStream(entry);
        } catch (e) {
            if (e instanceof IOException) {
                return new FileTreeWalkerEvent(FileTreeWalkerEventType.ENTRY, entry, undefined, e);
            }
            if (e instanceof SecurityException) {
                if (ignoreSecurityException) {
                    return null;
                }
            }
            throw e;
        }
        this.stack.push(new DirectoryNode(entry, attrs.fileKey(), stream));
        return new FileTreeWalkerEvent(FileTreeWalkerEventType.START_DIRECTORY, entry, attrs);
    }

    public async walk(file: Path): Promise<FileTreeWalkerEvent> {
        if (this.closed) {
            throw new IllegalArgumentException("Closed");
        }
        const ev = await this.visit(file, false, false);
        Objects.requireNonNullUndefined(ev);
        return ev as FileTreeWalkerEvent;
    }

    public async next(): Promise<FileTreeWalkerEvent | null> {
        let top: DirectoryNode | undefined = this.peek();
        if (Objects.isNullUndefined(top)) {
            return null;
        }
        top = top as DirectoryNode;

        let ev: FileTreeWalkerEvent | null = null;
        do {
            let entry: Path | undefined;
            let ioe: IOException | undefined;
            if (!top.skipped()) {
                const iterator: AsyncIterator<Path> = top.iterator();
                try {
                    const v = await iterator.next();
                    if (!v.done) {
                        entry = v.value;
                    }
                } catch (e) {
                    if (e instanceof DirectoryIteratorException) {
                        ioe = e.getCause();
                    } else {
                        throw e;
                    }
                }
            }
            if (!entry) {
                try {
                    top.stream().close();
                } catch (e) {
                    if (e instanceof IOException) {
                        if (!ioe) {
                            ioe = e;
                        }
                    } else {
                        throw e;
                    }
                }
                this.stack.pop();
                return new FileTreeWalkerEvent(FileTreeWalkerEventType.END_DIRECTORY, top.directory(), undefined, ioe);
            }

            ev = await this.visit(entry, true, true);
        } while (Objects.isNullUndefined(ev));
        return ev;
    }

    public pop(): void {
        if (!this.isEmpty()) {
            const node = this.stack.pop();
            try {
                node?.stream().close();
            } catch (ignore) {
                if (!(ignore instanceof IOException)) {
                    throw ignore;
                }
            }
        }
    }

    public skipRemainingSiblings(): void {
        if (!this.isEmpty()) {
            this.peek()?.skip();
        }
    }

    public isOpen(): boolean {
        return !this.closed;
    }

    public close(): void {
        if (!this.closed) {
            while (!this.isEmpty()) {
                this.pop();
            }
            this.closed = true;
        }
    }

    private isEmpty(): boolean {
        return this.stack.length === 0;
    }

    private peek(): DirectoryNode | undefined {
        return this.stack.at(-1);
    }

}

/**
 * The element on the walking stack corresponding to a directory node.
 */
class DirectoryNode implements AsyncIterable<Path> {
    private readonly _path: Path;
    private readonly _key: unknown;
    private readonly _stream: DirectoryStream<Path>;
    private readonly _iterator: AsyncIterator<Path>;
    private _skipped = false;

    constructor(path: Path, key: any, stream: DirectoryStream<Path>) {
        this._path = path;
        this._key = key;
        this._stream = stream;
        this._iterator = stream[Symbol.asyncIterator]();
    }

    directory(): Path {
        return this._path;
    }

    key(): unknown {
        return this._key;
    }

    stream(): DirectoryStream<Path> {
        return this._stream;
    }

    iterator(): AsyncIterator<Path> {
        return this._iterator;
    }

    [Symbol.asyncIterator](): AsyncIterator<Path> {
        return this._iterator;
    }

    skip(): void {
        this._skipped = true;
    }

    skipped(): boolean {
        return this._skipped;
    }
}

/**
 * Events returned by the {@link #walk} and {@link #next} methods.
 */
export class FileTreeWalkerEvent {
    private readonly _type: FileTreeWalkerEventType;
    private readonly _file: Path;
    private readonly _attributes: BasicFileAttributes | undefined;
    private readonly _ioeException: IOException | undefined;

    constructor(type: FileTreeWalkerEventType, file: Path, attrs?: BasicFileAttributes, ioe?: IOException) {
        this._type = type;
        this._file = file;
        this._attributes = attrs;
        this._ioeException = ioe;
    }

    public type(): FileTreeWalkerEventType {
        return this._type;
    }

    public file(): Path {
        return this._file;
    }

    public attributes(): BasicFileAttributes | undefined {
        return this._attributes;
    }

    public ioeException(): IOException | undefined {
        return this._ioeException;
    }

}

/**
 * The event types.
 */
export enum FileTreeWalkerEventType {
    /**
     * Start of a directory
     */
    START_DIRECTORY = "START_DIRECTORY",
    /**
     * End of a directory
     */
    END_DIRECTORY = "END_DIRECTORY",
    /**
     * An entry in a directory
     */
    ENTRY = "ENTRY"
}
