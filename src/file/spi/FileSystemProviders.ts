import {LocalFileSystemProvider} from "../fs/local";
import {FileSystemProvider} from "./FileSystemProvider";

/**
 * It returns an array of all the file system providers that are currently installed
 * @returns An array of FileSystemProvider objects.
 */
export function installedProviders(): FileSystemProvider[] { // TODO
    return [new LocalFileSystemProvider()]
}
