import {FileSystem} from "../FileSystem";
import {Path} from "../Path";
import {CopyOption} from "../CopyOption";
import {AccessMode} from "../AccessMode";
import {NoSuchFileException} from "../NoSuchFileException";
import {UnsupportedOperationException} from "../../exception/UnsupportedOperationException";

export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract newFileSystem(uri: URL, env: Map<string, any>): FileSystem;

    public newFileSystemFromPath(path: Path, env: Map<string, any>): FileSystem {
        throw new UnsupportedOperationException();
    }

    public abstract getFileSystem(url: URL): FileSystem;

    public abstract getPath(url: URL): Path;

    public abstract copy(source: Path, target: Path, options: CopyOption[]);

    public abstract move(source: Path, target: Path, options: CopyOption[]);

    public abstract checkAccess(obj: Path, modes?: AccessMode[]);

    public abstract isSameFile(obj1: Path, obj2: Path): boolean;

    public abstract isHidden(obj: Path): boolean;

    public abstract delete(path: Path) ;

    public deleteIfExists(path: Path): boolean {
        try {
            this.delete(path);
            return true;
        } catch (e) {
            if (e instanceof NoSuchFileException) {
                return false;
            }
        }
    }

}
