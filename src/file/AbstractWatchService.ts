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
        // empty
    }

}

/**
 * Base implementation class for watch services.
 */
export abstract class AbstractWatchService implements WatchService {

    private pendingsKeys: Array<WatchKey> = [];

    private readonly CLOSE_KEY: WatchKey = new CloseKey(null, null);
    private closed = false;

    public abstract register(path: Path, events: WatchEventKind<unknown>[], modifiers?: WatchEventModifier[]): Promise<WatchKey>;

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

    public async poll(timeout?: number, unit: ChronoUnit = ChronoUnit.MILLIS): Promise<WatchKey | null> {
        this.checkOpen();
        let key = this.pendingsKeys.pop();
        this.checkKey(key);
        if (!timeout || !unit) {
            return (key ?? null);
        }
        return new Promise<WatchKey>((resolve, reject) => {
            setTimeout(() => {
                try {
                    key = this.pendingsKeys.pop();
                    this.checkKey(key);
                    if (key) {
                        resolve(key);
                    }
                } catch (e) {
                    reject(e);
                }
            }, unit.duration().toMillis() * timeout);
        });
    }

    public take(): Promise<WatchKey> {
        this.checkOpen();
        let key: WatchKey | undefined;
        return new Promise<WatchKey>((resolve, reject) => {
            const id = setInterval(() => {
                try {
                    key = this.pendingsKeys.pop();
                    this.checkKey(key);
                    if (key) {
                        clearInterval(id);
                        resolve(key);
                    }
                } catch (e) {
                    reject(e);
                }
            }, 100);
        });
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


}
