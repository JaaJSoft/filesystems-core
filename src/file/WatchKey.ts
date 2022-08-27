import {WatchEvent} from "./WatchEvent";
import {Watchable} from "./Watchable";

export interface WatchKey {

    isValid(): boolean;

    pollEvents(): WatchEvent<any>[];

    reset(): boolean;

    cancel(): void;

    watchable(): Watchable;
}
