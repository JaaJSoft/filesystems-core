import {FileSystem} from "../FileSystem";
import {Path} from "../Path";
import {CopyOption} from "../CopyOption";
import {AccessMode} from "../AccessMode";
import {UnsupportedOperationException} from "../../exception/UnsupportedOperationException";
import {OpenOption} from "../OpenOption";
import {IllegalArgumentException} from "../../exception/IllegalArgumentException";

export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract newFileSystemFromUrl(url: URL, env: Map<string, any>);

    public abstract getFileSystem(url: URL): FileSystem;

    public abstract getPath(url: URL): Path;

    public newFileSystemFromPath(path: Path, env: Map<string, any>): FileSystem {
        throw new UnsupportedOperationException();
    }

    public newInputStream(path: Path, options?: OpenOption[]): ReadableStream {
        if (options && options.length > 0) {
            for (let opt of options) {
                // All OpenOption values except for APPEND and WRITE are allowed
                if (opt == OpenOption.APPEND ||
                    opt == OpenOption.WRITE) {
                    throw new UnsupportedOperationException("'" + opt + "' not allowed");
                }
            }

        }
        // TODO Chennels de mort
        return this.newInputStreamImpl(path, options);
    }

    protected abstract newInputStreamImpl(path: Path, options?: OpenOption[]): ReadableStream; // TODO replace this by channels if possible

    private static readonly DEFAULT_OPEN_OPTIONS = [OpenOption.CREATE, OpenOption.TRUNCATE_EXISTING, OpenOption.WRITE]

    /**
     * creates a new output stream.
     * @param {Path} path - The path to the file to open.
     * @param {OpenOption[]} [options] - OpenOption[]
     * @returns A WritableStream
     */
    public newOutputStream(path: Path, options?: OpenOption[]): WritableStream {
        let opts: Set<OpenOption>;
        if (options || options.length == 0) {
            opts = new Set<OpenOption>(FileSystemProvider.DEFAULT_OPEN_OPTIONS);
        } else {
            opts = new Set<OpenOption>();
            for (let opt of options) {
                if (opt == OpenOption.READ) {
                    throw new IllegalArgumentException("READ not allowed");
                }
                opts.add(opt);
            }
            opts.add(OpenOption.WRITE);
        }
        return this.newOutputStreamImpl(path, [...opts]);
    }

    protected abstract newOutputStreamImpl(path: Path, options?: OpenOption[]): WritableStream; // TODO replace this by channels if possible

    public abstract copy(source: Path, target: Path, options: CopyOption[]);

    public abstract move(source: Path, target: Path, options: CopyOption[]);

    public abstract checkAccess(obj: Path, modes: AccessMode[]);

    public abstract isSameFile(obj1: Path, obj2: Path): boolean;

    public abstract isHidden(obj: Path): boolean;
}
