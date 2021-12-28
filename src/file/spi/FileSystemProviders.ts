import {LocalFileSystemProvider} from "../fs/local/LocalFileSystemProvider";
import {FileSystemProvider} from "./FileSystemProvider";

export function installedProviders(): FileSystemProvider[] { // TODO
    return [new LocalFileSystemProvider()]
}