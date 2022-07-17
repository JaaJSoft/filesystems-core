import {Path} from "./Path";
import {FileSystemProvider} from "./spi/FileSystemProvider";
import {OpenOption} from "./OpenOption";
import {FileAttribute} from "./attribute/FileAttribute";
import {DirectoryStream} from "./DirectoryStream";
import {FileSystem} from "./FileSystem";
import {PathMatcher} from "./PathMatcher";
import {FileAlreadyExistsException} from "./FileAlreadyExistsException";
import {LinkOption} from "./LinkOption";
import {SecurityException} from "../exception/SecurityException";
import {NoSuchFileException} from "./NoSuchFileException";
import {FileSystemException} from "./FileSystemException";
import {BasicFileAttributes} from "./attribute/BasicFileAttributes";
import {FileAttributeView} from "./attribute/FileAttributeView";
import {PosixFilePermission} from "./attribute/PosixFilePermission";
import {PosixFileAttributes} from "./attribute/PosixFileAttributes";
import {UnsupportedOperationException} from "../exception/UnsupportedOperationException";
import {PosixFileAttributeView} from "./attribute/PosixFileAttributeView";

/* It provides a set of static methods for working with files and directories */
export class Files {

    // buffer size used for reading and writing
    private static BUFFER_SIZE: number = 8192;

    private constructor() {
        // static
    }

    /**
     * It returns the FileSystemProvider of the given Path
     * @param {Path} path - The path to the file or directory.
     * @returns The provider of the file system.
     */
    private static provider(path: Path): FileSystemProvider {
        return path.getFileSystem().provider();
    }

    public static newInputStream(path: Path, options?: OpenOption[]): ReadableStream {
        return this.provider(path).newInputStream(path, options);
    }

    /**
     * It creates a new output stream.
     * @param {Path} path - The path to the file to open.
     * @param {OpenOption[]} [options] - An array of options specifying how the file is created or opened.
     * @returns A WritableStream
     */
    public static newOutputStream(path: Path, options?: OpenOption[]): WritableStream {
        return this.provider(path).newOutputStream(path, options);
    }

    // -- Directories --

    public static newDirectoryStream(dir: Path): DirectoryStream<Path> {
        return this.provider(dir).newDirectoryStream(dir, _ => true)
    }

    public static newDirectoryStreamFilteredWithGlob(dir: Path, glob: string): DirectoryStream<Path> {
        if (glob === "*") {
            return this.newDirectoryStream(dir);
        }
        const fs: FileSystem = dir.getFileSystem();
        const matcher: PathMatcher = fs.getPathMatcher("glob:" + glob);
        return this.provider(dir).newDirectoryStream(dir, path => matcher.matches(path.getFileName()))
    }

    public static newDirectoryStreamFiltered(dir: Path, filter: (path: Path) => boolean): DirectoryStream<Path> {
        return this.provider(dir).newDirectoryStream(dir, filter);
    }

    // -- Creation and deletion --

    /**
     * `createFile` creates a file at the given path
     * @param {Path} path - The path to the file to be created.
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path
     */
    public static createFile(path: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(path).createFile(path, attrs);
        return path
    }

    /**
     * > Creates a directory at the given path, with the given attributes
     * @param {Path} dir - Path - The path to the directory to create.
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path of the directory that was created.
     */
    public static createDirectory(dir: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(dir).createDirectory(dir, attrs);
        return dir;
    }

    /**
     * > Create a directory by creating all nonexistent parent directories first
     * @param {Path} dir - Path
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path of the directory that was created.
     */
    public static createDirectories(dir: Path, attrs?: FileAttribute<any>[]): Path {
        try {
            this.createAndCheckIsDirectory(dir, attrs);
            return dir;
        } catch (x) {
            if (x instanceof FileAlreadyExistsException) {
                throw x;
            }
        }
        let se: SecurityException = null;
        try {
            dir = dir.toAbsolutePath();
        } catch (x) {
            if (x instanceof SecurityException) {
                se = x;
            }
        }
        let parent: Path = dir.getParent();
        while (parent != null) {
            try {
                this.provider(parent).checkAccess(parent);
                break;
            } catch (x) {
                if (x instanceof NoSuchFileException) {
                    // does not exist
                }
            }
            parent = parent.getParent();
        }
        if (parent == null) {
            if (se == null) {
                throw new FileSystemException(
                    dir.toString(),
                    null,
                    "Unable to determine if root directory exists"
                );
            } else {
                throw se;
            }
        }
        // create directories
        let child = parent;
        for (let name of parent.relativize(dir)) {
            child = child.resolve(name);
            this.createAndCheckIsDirectory(child, attrs);
        }
        return dir;
    }

    private static createAndCheckIsDirectory(dir: Path, attrs?: FileAttribute<any>[]) {
        try {
            this.createDirectory(dir, attrs);
        } catch (x) {
            if (x instanceof FileAlreadyExistsException && !this.isDirectory(dir, [LinkOption.NOFOLLOW_LINKS])) {
                throw x;
            }
        }
    }

    public static createTempFileIn(path: Path, prefix: string, suffix: string, attrs?: FileAttribute<any>[]): Path {
        throw new Error("Method not implemented.");
    }

    public static createTempFile(prefix: string, suffix: string, attrs?: FileAttribute<any>[]): Path {
        return this.createTempFileIn(null, prefix, suffix, attrs);
    }

    public static createTempDirectoryIn(path: Path, prefix: string, attrs?: FileAttribute<any>[]): Path {
        throw new Error("Method not implemented.");
    }

    public static createTempDirectory(prefix: string, attrs?: FileAttribute<any>[]): Path {
        return this.createTempDirectoryIn(null, prefix, attrs);
    }

    /**
     * `createSymbolicLink` creates a symbolic link at the given path to the given target
     * @param {Path} link - Path - The path to the symbolic link to create.
     * @param {Path} target - Path - The target of the link
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The link
     */
    public static createSymbolicLink(link: Path, target: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(link).createSymbolicLink(link, target, attrs);
        return link;
    }

    /**
     * It creates a link to an existing file.
     * @param {Path} link - The path to the link to be created.
     * @param {Path} existing - The path to the file that you want to link to.
     * @returns The link
     */
    public static createLink(link: Path, existing: Path): Path {
        this.provider(link).createLink(link, existing);
        return link;
    }

    /**
     * It deletes the file at the given path.
     * @param {Path} path - The path to the file or directory to delete.
     */
    public static delete(path: Path): void {
        this.provider(path).delete(path)
    }

    /**
     * It deletes a file if it exists.
     * @param {Path} path - The path to the file or directory to delete.
     * @returns A boolean value.
     */
    public static deleteIfExists(path: Path): boolean {
        return this.provider(path).deleteIfExists(path);
    }

    public static isDirectory(path: Path, options?: LinkOption[]): boolean {
        if (options.length === 0) {
            return this.provider(path).isDirectory(path);
        }
        try {
            return this.readAttributesFromType(path, undefined, options).isDirectory();
        } catch (ioe) {
            return false;
        }
    }

    public static isRegularFile(path: Path, options?: LinkOption[]): boolean {
        if (options.length === 0) {
            return this.provider(path).isRegularFile(path);
        }
        try {
            return this.readAttributesFromType(path, undefined, options).isRegularFile();
        } catch (ioe) {
            return false;
        }
    }

    /**
     * It reads the attributes of a file.
     * @param {Path} path - Path
     * @param type
     * @param {LinkOption} [options] - LinkOption
     * @returns BasicFileAttributes
     */
    public static readAttributesFromType(path: Path, type?: string, options?: LinkOption[]): BasicFileAttributes {
        return this.provider(path).readAttributesFromType(path, type, options);
    }

    public static readAttributes(path: Path, attributes: string, options?: LinkOption[]): Map<string, any> {
        return this.provider(path).readAttributes(path, attributes, options);
    }

    public static getFileAttributeView(path: Path, type?: string, options?: LinkOption[]): FileAttributeView {
        return this.provider(path).getFileAttributeView(path, type, options);
    }

    public static setAttribute(path: Path, attribute: string, value: any, options?: LinkOption[]): Path {
        this.provider(path).setAttribute(path, attribute, value, options);
        return path;
    }
    
    public static getPosixFilePermissions(path: Path, options?: LinkOption[]): Set<PosixFilePermission> {
        return (this.readAttributesFromType(path, "PosixFileAttributes", options) as PosixFileAttributes).permissions();
    }

    public static setPosixFilePermissions(path: Path, perms: Set<PosixFilePermission>): Path {
        const view = this.getFileAttributeView(path, "PosixFileAttributeView") as PosixFileAttributeView;
        if (!view) {
            throw new UnsupportedOperationException();
        }
        view.setPermissions(perms);
        return path;
    }

    /**
     * If the path is a directory, return true
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A boolean value.
     */

}
