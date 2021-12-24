import {FileSystem} from "./FileSystem";
import {URI} from "../net/URI";
import {LocalFileSystem} from "./fs/local/LocalFileSystem";

export function getDefault(): FileSystem {
    return new LocalFileSystem();
}

export function getFileSystem(uri: URI): FileSystem {
    return new LocalFileSystem();
}