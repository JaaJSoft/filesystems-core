import {Path} from "./Path";
import {FileSystemProvider} from "./spi/FileSystemProvider";

export class Files {

    // buffer size used for reading and writing
    private static BUFFER_SIZE: number = 8192;

    private constructor() {
    }

    private static provider(path: Path): FileSystemProvider {
        return path.getFileSystem().provider();
    }

    public static delete(path: Path) {
        this.provider(path).delete(path)
    }
}