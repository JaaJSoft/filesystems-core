import {WatchKey} from "./WatchKey";
import {WatchService} from "./WatchService";
import {WatchEventKind, WatchEventModifier} from "./WatchEvent";

export interface Watchable {
    register(watcher: WatchService, events: WatchEventKind<unknown>[], modifier?: WatchEventModifier[]): WatchKey;
}
