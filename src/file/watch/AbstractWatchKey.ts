import * as assert from "assert";
import {AbstractWatchService} from "./AbstractWatchService";
import {WatchKey} from "./WatchKey";
import {StandardWatchEventKinds} from "./StandardWatchEventKinds";
import {Path} from "../Path";
import {WatchEvent, WatchEventKind} from "./WatchEvent";

enum State {
    READY,
    SIGNALLED
}

/**
 * Base implementation class for watch keys.
 */
export abstract class AbstractWatchKey implements WatchKey {
    private readonly MAX_EVENT_LIST_SIZE = 512;

    /**
     * Special event to signal overflow
     */
    public readonly OVERFLOW_EVENT: Event<unknown> = new Event<unknown>(StandardWatchEventKinds.OVERFLOW); // TODO ??

    private readonly _watcher: AbstractWatchService;
    private readonly dir: Path;
    private state: State;
    private events: Array<WatchEvent<unknown>> = [];
    private lastModifyEvents: Map<unknown, WatchEvent<unknown>> = new Map<unknown, WatchEvent<unknown>>();

    protected constructor(dir: Path, watcher: AbstractWatchService) {
        this._watcher = watcher;
        this.dir = dir;
        this.state = State.READY;
    }

    public watcher(): AbstractWatchService {
        return this._watcher;
    }

    public watchable(): Path {
        return this.dir;
    }

    public signal(): void {
        if (this.state == State.READY) {
            this.state = State.SIGNALLED;
            this._watcher.enqueueKey(this);
        }
    }

    public signalEvent(kind: WatchEventKind<unknown>, context: unknown): void {
        let isModify = (kind == StandardWatchEventKinds.ENTRY_MODIFY);

        const size = this.events.length;
        if (size > 0) {
            // if the previous event is an OVERFLOW event or this is a
            // repeated event then we simply increment the counter
            const prev = this.events[size - 1];
            if ((prev.kind() == StandardWatchEventKinds.OVERFLOW) ||
                ((kind == prev.kind() &&
                    context === prev.context()))) {
                (prev as Event<unknown>).increment();
                return;
            }

            // if this is a modify event and the last entry for the context
            // is a modify event then we simply increment the count
            if (this.lastModifyEvents.size > 0) {
                if (isModify) {
                    const ev = this.lastModifyEvents.get(context);
                    if (ev != null) {
                        assert.strictEqual(ev.kind(), StandardWatchEventKinds.ENTRY_MODIFY);
                        (prev as Event<unknown>).increment();
                        return;
                    }
                } else {
                    // not a modify event so remove from the map as the
                    // last event will no longer be a modify event.
                    this.lastModifyEvents.delete(context);
                }
            }

            // if the list has reached the limit then drop pending events
            // and queue an OVERFLOW event
            if (size >= this.MAX_EVENT_LIST_SIZE) {
                kind = StandardWatchEventKinds.OVERFLOW;
                isModify = false;
                context = null;
            }
        }

        // non-repeated event
        const ev =
            new Event<unknown>(kind, context);
        if (isModify) {
            this.lastModifyEvents.set(context, ev);
        } else if (kind == StandardWatchEventKinds.OVERFLOW) {
            // drop all pending events
            this.events = [];
            this.lastModifyEvents.clear();
        }
        this.events.push(ev);
        this.signal();
    }

    pollEvents(): WatchEvent<unknown>[] {
        const result = this.events;
        this.events = [];
        this.lastModifyEvents.clear();
        return result;
    }

    reset(): boolean {
        if (this.state == State.SIGNALLED && this.isValid()) {
            if (this.events.length === 0) {
                this.state = State.READY;
            } else {
                // pending events so re-queue key
                this._watcher.enqueueKey(this);
            }
        }
        return this.isValid();
    }

    public abstract cancel(): void ;

    public abstract isValid(): boolean ;

    public abstract init(): void ;

}


class Event<T> implements WatchEvent<T> {
    private readonly _kind: WatchEventKind<T>;
    private readonly _context: T | null;
    private _count: bigint;

    constructor(kind: WatchEventKind<T>, context: T | null = null) {
        this._kind = kind;
        this._context = context;
        this._count = 1n;
    }

    context(): T | null {
        return this._context;
    }

    count(): bigint {
        return this._count;
    }

    kind(): WatchEventKind<T> {
        return this._kind;
    }

    increment(): void {
        this._count++;
    }
}
