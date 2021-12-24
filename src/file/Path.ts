import {URI} from "../net/URI";
import {LocalPath} from "./fs/LocalPath";

export abstract class Path {
}

export function of(first: string, more: string[]): Path {
    return new LocalPath();
}

export function ofURI(uri: URI): Path {
    return new LocalPath();
}