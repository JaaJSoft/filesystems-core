import {FileSystem} from "../FileSystem";
import {Path} from "../Path";
import {CopyOption} from "../CopyOption";
import {AccessMode} from "../AccessMode";
import {NoSuchFileException} from "../NoSuchFileException";
import {UnsupportedOperationException} from "../../exception/UnsupportedOperationException";
import {OpenOption} from "../OpenOption";
import {IllegalArgumentException} from "../../exception/IllegalArgumentException";
import {BasicFileAttributes} from "../attribute/BasicFileAttributes";
import {FileAttribute} from "../attribute/FileAttribute";
import {FileStore} from "../FileStore";
import {LinkOption} from "../LinkOption";
import {FileAttributeView} from "../attribute/FileAttributeView";

/* A contract for file system providers. */
export abstract class FileSystemProvider {
    public abstract getScheme(): string;

    public abstract newFileSystemFromUrl(uri: URL, env: Map<string, any>): FileSystem;

    public newFileSystemFromPath(path: Path, env: Map<string, any>): FileSystem {
        throw new UnsupportedOperationException();
    }

    public abstract getFileSystem(url: URL): FileSystem;

    public abstract getPath(url: URL): Path;

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
    public abstract newDirectoryStream(dir: Path, acceptFilter: (path: Path) => boolean);

    public abstract createFile(dir: Path, attrs?: FileAttribute<any>[]): void;

    public abstract createDirectory(dir: Path, attrs?: FileAttribute<any>[]): void;

    /**
     * Creates a symbolic link to a target. This method works in exactly the
     * manner specified by the {@link Files#createSymbolicLink} method.
     *
     * <p> The default implementation of this method throws {@code
     * UnsupportedOperationException}.
     *
     * @param   link
     *          the path of the symbolic link to create
     * @param   target
     *          the target of the symbolic link
     * @param   attrs
     *          the array of attributes to set atomically when creating the
     *          symbolic link
     *
     * @throws  UnsupportedOperationException
     *          if the implementation does not support symbolic links or the
     *          array contains an attribute that cannot be set atomically when
     *          creating the symbolic link
     * @throws  FileAlreadyExistsException
     *          if a file with the name already exists <i>(optional specific
     *          exception)</i>
     */
    public createSymbolicLink(link: Path, target: Path, attrs?: FileAttribute<any>[]): void {
        throw new UnsupportedOperationException();
    }

    /**
     * Creates a new link (directory entry) for an existing file. This method
     * works in exactly the manner specified by the {@link Files#createLink}
     * method.
     *
     * <p> The default implementation of this method throws {@code
     * UnsupportedOperationException}.
     *
     * @param   link
     *          the link (directory entry) to create
     * @param   existing
     *          a path to an existing file
     *
     * @throws  UnsupportedOperationException
     *          if the implementation does not support adding an existing file
     *          to a directory
     * @throws  FileAlreadyExistsException
     *          if the entry could not otherwise be created because a file of
     *          that name already exists <i>(optional specific exception)</i>
     */
    public createLink(link: Path, existing: Path): void {
        throw new UnsupportedOperationException();
    }

    public readSymbolicLink(link: Path): Path {
        throw new UnsupportedOperationException();
    }

    public abstract delete(path: Path): void;

    /**
     * If the file exists, delete it and return true. Otherwise, return false
     * @param {Path} path - The path to the file or directory to delete.
     * @returns A boolean value.
     */
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

    public abstract copy(source: Path, target: Path, options?: CopyOption[]): void;

    public abstract move(source: Path, target: Path, options?: CopyOption[]): void;

    public abstract isSameFile(obj1: Path, obj2: Path): boolean;

    public abstract isHidden(obj: Path): boolean;

    public abstract getFileStore(path: Path): FileStore;

    public abstract checkAccess(obj: Path, modes?: AccessMode[]): void;

    public abstract readAttributesFromType(path: Path, type?: string, options?: LinkOption[]): BasicFileAttributes;

    public abstract readAttributes(path: Path, attributes: string, options?: LinkOption[]): Map<string, any>;

    public abstract getFileAttributeView(path: Path, type?: string, options?: LinkOption[]): FileAttributeView;

    public abstract setAttribute(path: Path, attribute: string, value: any, options?: LinkOption[]): void;

}
