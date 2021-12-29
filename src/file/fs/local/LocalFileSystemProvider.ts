import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";

export class LocalFileSystemProvider extends FileSystemProvider {
    private readonly theFileSystem: LocalFileSystem;

    constructor() {
        super();
        this.theFileSystem = new LocalFileSystem(this, "/"); // TODO user dir
    }

    getTheFileSystem(): LocalFileSystem {
        return this.theFileSystem;
    }

    getFileSystem(url: URL): FileSystem {
        return undefined;
    }

    getPath(url: URL): Path {
        return undefined;
    }

    getScheme(): string {
        return "file";
    }

}