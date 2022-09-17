import {FileTreeWalker, FileTreeWalkerEvent, FileTreeWalkerEventType} from "./FileTreeWalker";
import {Closeable} from "../Closeable";
import {Path} from "./Path";
import {FileVisitOption} from "./FileVisitOption";
import {Objects} from "../utils";
import {BasicFileAttributes} from "./attribute";
import {IllegalStateException} from "../exception";


export class FileTreeIterator implements AsyncIterator<FileTreeWalkerEvent | null>, Closeable {
    private readonly walker: FileTreeWalker;
    private nextEvent: FileTreeWalkerEvent | null = null;


    constructor(maxDepth: number, options?: FileVisitOption[]) {
        this.walker = new FileTreeWalker(options ? options : [], maxDepth);

    }

    public async init(start: Path): Promise<FileTreeIterator> {
        this.nextEvent = await this.walker.walk(start);
        if (!(this.nextEvent.type() === FileTreeWalkerEventType.ENTRY || this.nextEvent.type() === FileTreeWalkerEventType.START_DIRECTORY)) {
            throw new Error("Should not get here");
        }
        const ioe = this.nextEvent.ioeException();
        if (ioe) {
            throw ioe;
        }
        return this;
    }

    private async fetchNextIfNeeded(): Promise<void> {
        if (!this.nextEvent) {
            let ev = await this.walker.next();
            while (ev) {
                const ioe = ev.ioeException();
                if (ioe)
                    throw ioe;
                // END_DIRECTORY events are ignored
                if (ev.type() !== FileTreeWalkerEventType.END_DIRECTORY) {
                    this.nextEvent = ev;
                    return;
                }
                ev = await this.walker.next();
            }
        }
    }

    public async hasNext(): Promise<boolean> {
        if (!this.walker.isOpen()) {
            throw new IllegalStateException();
        }
        await this.fetchNextIfNeeded();
        return Objects.nonNullUndefined(this.nextEvent);
    }

    public async next(...args: [] | [undefined]): Promise<IteratorResult<FileTreeWalkerEvent | null>> {
        if (!this.walker.isOpen()) {
            throw new IllegalStateException();
        }
        await this.fetchNextIfNeeded();
        const result = this.nextEvent;
        const done = !await this.hasNext();
        this.nextEvent = null;
        return {
            value: result,
            done: done,
        };
    }

    public close(): void {
        this.walker.close();
    }

    /**
     * "Return an iterable of all the paths in the tree, starting at the root and going down to the leaves, and optionally
     * filtering out some paths."
     *
     * The function takes a single parameter, which is a function that takes a path and returns a boolean. The function is
     * called for each path in the tree, and if it returns true, the path is included in the iterable. If it returns false,
     * the path is not included
     * @param filter - (path: Path | undefined) => boolean = _ => true
     * @returns An iterable object that can be used to iterate over the paths in the tree.
     */
    public toIterablePath(filter: (path: Path, attrs?: BasicFileAttributes) => boolean = () => true): AsyncIterable<Path> {
        return new PathIterable(this, filter) as AsyncIterable<Path>;
    }

}

class PathIterable implements AsyncIterable<Path | null> {
    private readonly fileTreeIterator: FileTreeIterator;
    private readonly filter: (path: Path, attrs: BasicFileAttributes | undefined) => boolean;


    constructor(fileTreeIterator: FileTreeIterator, filter: (path: Path, attrs?: BasicFileAttributes) => boolean) {
        this.fileTreeIterator = fileTreeIterator;
        this.filter = filter;
    }

    public [Symbol.asyncIterator](): AsyncIterator<Path | null> {
        const fileTreeIterator = this.fileTreeIterator;
        const filter = this.filter;
        return new class implements AsyncIterator<Path | null> {
            public async next(...args: [] | [undefined]): Promise<IteratorResult<Path | null>> {
                try {
                    let path: Path | null = null;
                    let attrs: BasicFileAttributes | undefined;
                    let done: boolean | undefined = false;
                    do {
                        const next: IteratorResult<FileTreeWalkerEvent | null> = await fileTreeIterator.next(...args);
                        path = next.value.file();
                        attrs = next.value.attributes();
                        done = next.done;
                    } while (!done && path && !filter(path, attrs));
                    return {
                        value: path ? path : null,
                        done: done,
                    };
                } catch (e) {
                    fileTreeIterator.close();
                    throw e;
                }
            }

            public async throw(_e?: any): Promise<IteratorResult<Path>> {
                fileTreeIterator.close();
                return {
                    value: undefined,
                    done: true,
                };
            }
        };
    }

}

