import {FileSystem} from "../FileSystem";
import {Path} from "../Path";

export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract getFileSystem(url: URL): FileSystem;

    public abstract getPath(url: URL): Path;


}