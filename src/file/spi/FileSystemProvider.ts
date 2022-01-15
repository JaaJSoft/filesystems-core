import {FileSystem} from "../FileSystem";
import {Path} from "../Path";
import {CopyOption} from "../CopyOption";
import {AccessMode} from "../AccessMode";

export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract getFileSystem(url: URL): FileSystem;

    public abstract getPath(url: URL): Path;

    public abstract copy(source: Path, target: Path, options: CopyOption[]);

    public abstract move(source: Path, target: Path, options: CopyOption[]);

    public abstract checkAccess(obj: Path, modes: AccessMode[]);

    public abstract isSameFile(obj1: Path, obj2: Path): boolean;

    public abstract isHidden(obj: Path): boolean;
}
