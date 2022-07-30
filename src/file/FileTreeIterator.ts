import {FileTreeWalker, FileTreeWalkerEvent, FileTreeWalkerEventType} from "./FileTreeWalker";
import {Closeable} from "../Closeable";
import {Path} from "./Path";
import {FileVisitOption} from "./FileVisitOption";
import {IllegalStateException} from "@js-joda/core";
import {Objects} from "../utils";

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
}
