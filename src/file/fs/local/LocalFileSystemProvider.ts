import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {URI} from "../../../net/URI";
import {Path} from "../../Path";

export class LocalFileSystemProvider extends FileSystemProvider {
    getFileSystem(uri: URI): FileSystem {
        return undefined;
    }

    getPath(uri: URI): Path {
        return undefined;
    }

    getScheme(): string {
        return "";
    }

}