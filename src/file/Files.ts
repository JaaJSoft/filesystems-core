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

    public static createFile(path: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(path).createFile(path, attrs);
        return path
    }

    public static createDirectory(dir: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(dir).createDirectory(dir, attrs);
        return dir;
    }

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

    public static createSymbolicLink(link: Path, target: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(link).createSymbolicLink(link, target, attrs);
        return link;
    }

    public static createLink(link: Path, existing: Path): Path {
        this.provider(link).createLink(link, existing);
        return link;
    }

    public static delete(path: Path) {
        this.provider(path).delete(path)
    }

    public static deleteIfExists(path: Path): boolean {
        return this.provider(path).deleteIfExists(path);
    }

    public static readAttributes(path: Path, options?: LinkOption): BasicFileAttributes {
        return this.provider(path).readAttributes(path, options);
    }

    public static isDirectory(path: Path, options?: LinkOption[]): boolean {
        if (options.length === 0) {
            return this.provider(path).isDirectory(path);
        }
        try {
            return this.readAttributes(path).isDirectory();
        } catch (ioe) {
            return false;
        }
    }

    public static isRegularFile(path: Path, options?: LinkOption[]): boolean {
        if (options.length === 0) {
            return this.provider(path).isRegularFile(path);
        }
        try {
            return this.readAttributes(path).isRegularFile();
        } catch (ioe) {
            return false;
        }
    }
}
