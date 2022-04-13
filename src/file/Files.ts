import {Path} from "./Path";
import {FileSystemProvider} from "./spi/FileSystemProvider";
import {OpenOption} from "./OpenOption";

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

    public static newInputStream(path: Path, options?: OpenOption[]) : ReadableStream {
        return this.provider(path).newInputStream(path, options);
    }
    public static newOutputStream(path: Path, options?: OpenOption[]) : WritableStream {
        return this.provider(path).newOutputStream(path, options);
    }
}
