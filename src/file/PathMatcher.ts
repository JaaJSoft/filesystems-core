import {Path} from "./Path";

export interface PathMatcher {
    matches(path: Path | null): boolean;
}
