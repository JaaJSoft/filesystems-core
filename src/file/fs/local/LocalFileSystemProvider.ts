import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";

export class LocalFileSystemProvider extends FileSystemProvider {
    private readonly theFileSystem: LocalFileSystem;

    constructor() {
        super();
        this.theFileSystem = new LocalFileSystem(this, os.homedir());
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