import {LocalPath} from "./LocalPath";
import fs from "fs";

export function getPathStats(path: LocalPath, followLinks: boolean): fs.Stats {
    return (followLinks ? fs.statSync(path.toString()) : fs.lstatSync(path.toString()));
}
