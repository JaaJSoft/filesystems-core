import {Path} from "./Path";
import {FileSystemProvider} from "./spi/FileSystemProvider";
import {OpenOption} from "./OpenOption";
import {FileAttribute} from "./attribute/FileAttribute";

export class Files {

    // buffer size used for reading and writing
    private static BUFFER_SIZE: number = 8192;

    private constructor() {
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

    public static createFile(path: Path, attrs?: FileAttribute<any>[]): Path {
        return this.provider(path).createFile(path, attrs);
    }

    public static createDirectory(path: Path, attrs?: FileAttribute<any>[]): Path {
        return this.provider(path).createDirectory(path, attrs);
    }

    public static createDirectories(path: Path, attrs?: FileAttribute<any>[]): Path {
        return this.provider(path).createDirectories(path, attrs);
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
        return this.provider(path).deleteIfExists(path)
    }
}
