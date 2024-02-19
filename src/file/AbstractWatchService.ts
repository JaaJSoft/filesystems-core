import {WatchService} from "./WatchService";
import {WatchKey} from "./WatchKey";
import {AbstractWatchKey} from "./AbstractWatchKey";
import {Path} from "./Path";
import {WatchEventKind, WatchEventModifier} from "./WatchEvent";
import {ClosedWatchServiceException} from "./exception";
import {ChronoUnit} from "@js-joda/core";


class CloseKey extends AbstractWatchKey {

    constructor(dir: Path | null, watcher: AbstractWatchService | null) {
        super(dir as Path, watcher as AbstractWatchService);
    }

    cancel(): void {
        //
    }

    isValid(): boolean {
        return true;
    }

    public init(): void {
    }

}

/**
 * Base implementation class for watch services.
 */
export abstract class AbstractWatchService implements WatchService {

    private pendingsKeys: Array<WatchKey> = [];

    private readonly CLOSE_KEY: WatchKey = new CloseKey(null, null);
    private closed = false;

    public abstract register(path: Path, events: WatchEventKind<unknown>[], modifiers?: WatchEventModifier[]): WatchKey;

    public abstract init(): void;

    public enqueueKey(key: WatchKey) {
        this.pendingsKeys.push(key);
    }

    private checkOpen(): void {
        if (this.closed) {
            throw new ClosedWatchServiceException();
        }
    }

    private checkKey(key: WatchKey | undefined): void {
        if (key == this.CLOSE_KEY) {
            this.enqueueKey(key);
        }
        this.checkOpen();
    }

    public async poll(timeout?: bigint, unit?: ChronoUnit): Promise<WatchKey | null> {
        this.checkOpen();
        const key = this.pendingsKeys.pop();
        this.checkKey(key);
        return (key ?? null);
    }

    public isOpen(): boolean {
        return !this.closed;
    }

    public abstract implClose(): Promise<void>;

    async close(): Promise<void> {
        if (this.closed) {
            return;
        }
        this.closed = true;
        await this.implClose();
        this.pendingsKeys = [];
        this.pendingsKeys.push(this.CLOSE_KEY);
    }

    public take(): Promise<WatchKey> {
        throw new Error("Method not implemented.");
    }

}
