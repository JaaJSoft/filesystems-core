import {FileTreeWalker, FileTreeWalkerEvent, FileTreeWalkerEventType} from "./FileTreeWalker";
import {Closeable} from "../Closeable";
import {Path} from "./Path";
import {FileVisitOption} from "./FileVisitOption";
import {Objects} from "../utils";
import {BasicFileAttributes} from "./attribute";
import {IllegalStateException} from "../exception";


export class FileTreeIterator implements Iterator<FileTreeWalkerEvent | undefined>, Closeable {
    private readonly walker: FileTreeWalker;
    private nextEvent: FileTreeWalkerEvent | undefined;


    constructor(start: Path, maxDepth: number, options?: FileVisitOption[]) {
        this.walker = new FileTreeWalker(options ? options : [], maxDepth);
        this.nextEvent = this.walker.walk(start);
        if (!(this.nextEvent.type() === FileTreeWalkerEventType.ENTRY || this.nextEvent.type() === FileTreeWalkerEventType.START_DIRECTORY)) {
            throw new Error("Should not get here");
        }
        const ioe = this.nextEvent.ioeException();
        if (ioe) {
            throw ioe;
        }
    }

    private fetchNextIfNeeded(): void {
        if (!this.nextEvent) {
            let ev = this.walker.next();
            while (ev) {
                const ioe = ev.ioeException();
                if (ioe)
                    throw ioe;
                // END_DIRECTORY events are ignored
                if (ev.type() !== FileTreeWalkerEventType.END_DIRECTORY) {
                    this.nextEvent = ev;
                    return;
                }
                ev = this.walker.next();
            }
        }
    }

    public hasNext(): boolean {
        if (!this.walker.isOpen()) {
            throw new IllegalStateException();
        }
        this.fetchNextIfNeeded();
        return Objects.nonNullUndefined(this.nextEvent);
    }

    public next(...args: [] | [undefined]): IteratorResult<FileTreeWalkerEvent | undefined, any> {
        if (!this.walker.isOpen()) {
            throw new IllegalStateException();
        }
        this.fetchNextIfNeeded();
        const result = this.nextEvent;
        const done: boolean = !this.hasNext();
        this.nextEvent = undefined;
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
    public toIterablePath(filter: (path: Path, attrs: BasicFileAttributes | undefined) => boolean = () => true): Iterable<Path> {
        return new PathIterable(this, filter) as Iterable<Path>;
    }

}

class PathIterable implements Iterable<Path | undefined> {
    private readonly fileTreeIterator: FileTreeIterator;
    private readonly filter: (path: Path, attrs: BasicFileAttributes | undefined) => boolean;


    constructor(fileTreeIterator: FileTreeIterator, filter: (path: Path, attrs: BasicFileAttributes | undefined) => boolean) {
        this.fileTreeIterator = fileTreeIterator;
        this.filter = filter;
    }

    public [Symbol.iterator](): Iterator<Path | undefined> {
        const fileTreeIterator = this.fileTreeIterator;
        const filter = this.filter;
        return new class implements Iterator<Path | undefined> {
            public next(...args: [] | [undefined]): IteratorResult<Path | undefined, any> {
                try {
                    let path: Path | undefined;
                    let attrs: BasicFileAttributes | undefined;
                    let done: boolean | undefined = false;
                    do {
                        const next: IteratorResult<FileTreeWalkerEvent | undefined, any> = fileTreeIterator.next(...args);
                        path = next.value.file();
                        attrs = next.value.attributes();
                        done = next.done;
                    } while (!done && !filter(path as Path, attrs));
                    return {
                        value: path,
                        done: done,
                    };
                } catch (e) {
                    fileTreeIterator.close();
                    throw e;
                }
            }

            public throw(_e?: any): IteratorResult<Path, any> {
                fileTreeIterator.close();
                return {
                    value: undefined,
                    done: true,
                };
            }
        };
    }

}

