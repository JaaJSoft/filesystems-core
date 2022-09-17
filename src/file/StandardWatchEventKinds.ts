import {WatchEventKind} from "./WatchEvent";
import {Path} from "./Path";

class StdWatchEventKind implements WatchEventKind {

    private readonly _name: string;

    private readonly _type: string;

    constructor(name: string, type: string) {
        this._name = name;
        this._type = type;
    }

    public name(): string {
        return this._name;
    }

    public type(): string {
        return this._type;
    }
}

export class StandardWatchEventKinds {

    /**
     * A special event to indicate that events may have been lost or
     * discarded.
     *
     * <p> The {@link WatchEvent#context context} for this event is
     * implementation specific and may be {@code null}. The event {@link
        * WatchEvent#count count} may be greater than {@code 1}.
     *
     * @see WatchService
     */
    public static readonly OVERFLOW = new StdWatchEventKind("OVERFLOW", typeof Object);

    /**
     * Directory entry created.
     *
     * <p> When a directory is registered for this event then the {@link WatchKey}
     * is queued when it is observed that an entry is created in the directory
     * or renamed into the directory. The event {@link WatchEvent#count count}
     * for this event is always {@code 1}.
     */
    public static readonly ENTRY_CREATE = new StdWatchEventKind("ENTRY_CREATE", typeof Path);

    /**
     * Directory entry deleted.
     *
     * <p> When a directory is registered for this event then the {@link WatchKey}
     * is queued when it is observed that an entry is deleted or renamed out of
     * the directory. The event {@link WatchEvent#count count} for this event
     * is always {@code 1}.
     */
    public static readonly ENTRY_DELETE = new StdWatchEventKind("ENTRY_DELETE", typeof Path);

    /**
     * Directory entry modified.
     *
     * <p> When a directory is registered for this event then the {@link WatchKey}
     * is queued when it is observed that an entry in the directory has been
     * modified. The event {@link WatchEvent#count count} for this event is
     * {@code 1} or greater.
     */
    public static readonly ENTRY_MODIFY = new StdWatchEventKind("ENTRY_MODIFY", typeof Path);

}

