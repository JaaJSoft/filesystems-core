import {FileSystem} from "./FileSystem";
import {LocalFileSystem} from "./fs/local/LocalFileSystem";

export class FileSystems {
    public static getDefault(): FileSystem {
        return new LocalFileSystem();
    }

    public static getFileSystem(url: URL): FileSystem {
        return new LocalFileSystem();
    }

}