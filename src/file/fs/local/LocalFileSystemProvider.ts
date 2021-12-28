import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";

export class LocalFileSystemProvider extends FileSystemProvider {
    getFileSystem(url: URL): FileSystem {
        return undefined;
    }

    getPath(url: URL): Path {
        return undefined;
    }

    getScheme(): string {
        return "";
    }

}