import {Closeable} from "../Closeable";
import {LinkOption} from "./LinkOption";
import {Path} from "./Path";
import {DirectoryStream} from "./DirectoryStream";
import {BasicFileAttributes, BasicFileAttributesHolder} from "./attribute";
import {IllegalArgumentException, IOException, SecurityException} from "../exception";
import {FileVisitOption} from "./FileVisitOption";
import {Objects} from "../utils";
import {Files} from "./Files";
import {FileSystemLoopException} from "./exception";
import {DirectoryIteratorException} from "./exception/DirectoryIteratorException";

export class FileTreeWalker implements Closeable {
    private readonly followLinks: boolean;
    private readonly linkOptions: LinkOption[];
    private readonly maxDepth: number;
    private readonly stack: DirectoryNode[] = [];
    private closed: boolean = false;

    constructor(options: FileVisitOption[], maxDepth: number) {
        let fl: boolean = false;
        for (let option of options) {
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
     * the walk is following sym links is not. The {@code canUseCached}
     * argument determines whether this method can use cached attributes.
     */
    private getAttributes(file: Path, canUseCached: boolean): BasicFileAttributes {
        if (canUseCached && "get" in file && "invalidate" in file) {
            const cached = (file as unknown as BasicFileAttributesHolder).get();
            if (Objects.nonNullUndefined(cached) && (!this.followLinks || !cached?.isSymbolicLink())) {
                return cached as BasicFileAttributes;
            }
        }
        // attempt to get attributes of file. If fails and we are following
        // links then a link target might not exist so get attributes of link
        let attrs: BasicFileAttributes;
        try {
            attrs = Files.readAttributesByType(file, "BasicFileAttributes", this.linkOptions);
        } catch (e) {
            if (!(e instanceof IOException)) {
                throw e;
            }
            if (!this.followLinks) {
                throw e;
            }
            attrs = Files.readAttributesByType(file, "BasicFileAttributes", [LinkOption.NOFOLLOW_LINKS]);
        }
        return attrs;
    }

    private wouldLoop(dir: Path, key: any): boolean {
        for (let ancestor of this.stack) {
            const ancestorKey: any = ancestor.key();
            if (Objects.nonNullUndefined(key) && Objects.nonNullUndefined(ancestorKey)) {
                if (key.valueOf() === ancestorKey.valueOf()) {// TODO check for better equals
                    return true;
                }
            } else {
                try {
                    if (Files.isSameFile(dir, ancestor.directory())) {
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

    private visit(entry: Path, ignoreSecurityException: boolean, canUseCached: boolean): FileTreeWalkerEvent | undefined {
        let attrs: BasicFileAttributes;
        try {
            attrs = this.getAttributes(entry, canUseCached);
        } catch (e) {
            if (e instanceof IOException) {
                return new FileTreeWalkerEvent(EventType.ENTRY, entry, undefined, e);
            }
            if (e instanceof SecurityException) {
                if (ignoreSecurityException) {
                    return undefined;
                }
            }
            throw e;
        }
        // at maximum depth or file is not a directory
        const depth = this.stack.length;
        if (depth >= this.maxDepth || !attrs.isDirectory()) {
            return new FileTreeWalkerEvent(EventType.ENTRY, entry, attrs);
        }

        // check for cycles when following links
        if (this.followLinks && this.wouldLoop(entry, attrs.fileKey())) {
            return new FileTreeWalkerEvent(EventType.ENTRY, entry, undefined, new FileSystemLoopException(entry.toString()));
        }

        // file is a directory, attempt to open it
        let stream: DirectoryStream<Path>;
        try {
            stream = Files.newDirectoryStream(entry);
        } catch (e) {
            if (e instanceof IOException) {
                return new FileTreeWalkerEvent(EventType.ENTRY, entry, undefined, e);
            }
            if (e instanceof SecurityException) {
                if (ignoreSecurityException) {
                    return undefined;
                }
            }
            throw e;
        }
        this.stack.push(new DirectoryNode(entry, attrs.fileKey(), stream));
        return new FileTreeWalkerEvent(EventType.START_DIRECTORY, entry, attrs);
    }

    public walk(file: Path): FileTreeWalkerEvent {
        if (this.closed) {
            throw new IllegalArgumentException("Closed");
        }
        const ev = this.visit(file, false, false);
        Objects.requireNonNullUndefined(ev);
        return ev as FileTreeWalkerEvent;
    }

    public next(): FileTreeWalkerEvent | undefined {
        let top: DirectoryNode | undefined = this.peek();
        if (Objects.isNullUndefined(top)) {
            return undefined;
        }
        top = top as DirectoryNode;

        let ev: FileTreeWalkerEvent | undefined;
        do {
            let entry: Path | undefined;
            let ioe: IOException | undefined;
            if (!top.skipped()) {
                const iterator: Iterator<Path> = top.iterator();
                try {
                    const v = iterator.next();
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
                return new FileTreeWalkerEvent(EventType.END_DIRECTORY, top.directory(), undefined, ioe);
            }

            ev = this.visit(entry, true, true);
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
class DirectoryNode implements Iterable<Path> {
    private readonly _path: Path;
    private readonly _key: Object;
    private readonly _stream: DirectoryStream<Path>;
    private readonly _iterator: Iterator<Path>;
    private _skipped: boolean = false;

    constructor(path: Path, key: any, stream: DirectoryStream<Path>) {
        this._path = path;
        this._key = key;
        this._stream = stream;
        this._iterator = stream[Symbol.iterator]();
    }

    directory(): Path {
        return this._path;
    }

    key(): Object {
        return this._key;
    }

    stream(): DirectoryStream<Path> {
        return this._stream;
    }

    iterator(): Iterator<Path> {
        return this._iterator;
    }

    [Symbol.iterator](): Iterator<Path> {
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
class FileTreeWalkerEvent {
    private readonly _type: EventType;
    private readonly _file: Path;
    private readonly _attributes: BasicFileAttributes | undefined;
    private readonly _ioeException: IOException | undefined;

    constructor(type: EventType, file: Path, attrs?: BasicFileAttributes, ioe?: IOException) {
        this._type = type;
        this._file = file;
        this._attributes = attrs;
        this._ioeException = ioe;
    }


    public type(): EventType {
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
enum EventType {
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
