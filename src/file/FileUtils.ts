import {LinkOption} from "./LinkOption";
import {NullPointerException} from "../exception";

export function followLinks(options?: LinkOption[]): boolean {
    let _followLinks = true;
    if (options) {
        for (let opt of options) {
            if (opt === LinkOption.NOFOLLOW_LINKS) {
                _followLinks = false;
                continue;
            }
            if (!opt) {
                throw new NullPointerException();
            }
            throw Error("Should not get here");
        }
    }
    return _followLinks;
}
