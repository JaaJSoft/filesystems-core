import {WatchKey} from "./watch/WatchKey";
import {WatchService} from "./watch/WatchService";
import {WatchEventKind, WatchEventModifier} from "./watch/WatchEvent";

export interface Watchable {
    register(watcher: WatchService, events: WatchEventKind<unknown>[], modifier?: WatchEventModifier[]): Promise<WatchKey>;
}
