import {FileSystem} from "./FileSystem";
import {URI} from "../net/URI";
import {LocalFileSystem} from "./fs/local/LocalFileSystem";

export class FileSystems {
    public static getDefault(): FileSystem {
        return new LocalFileSystem();
    }

    public static getFileSystem(uri: URI): FileSystem {
        return new LocalFileSystem();
    }

}