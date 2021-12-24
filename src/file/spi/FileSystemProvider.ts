import {LocalFileSystemProvider} from "../fs/local/LocalFileSystemProvider";
import {URI} from "../../net/URI";
import {FileSystem} from "../FileSystem";
import {Path} from "../Path";

export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract getFileSystem(uri: URI): FileSystem;

    public abstract getPath(uri: URI): Path;

    public static installedProviders(): FileSystemProvider[] { // TODO
        return [new LocalFileSystemProvider()]
    }
}