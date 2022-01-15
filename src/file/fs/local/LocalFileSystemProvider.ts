import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import * as jsurl from "url"
import {AccessMode} from "../../AccessMode";
import {CopyOption} from "../../CopyOption";
import {AccessDeniedException} from "../../AccessDeniedException";

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
        const urlToPath = jsurl.fileURLToPath(url);
        return this.theFileSystem.getPath(urlToPath).getFileSystem();
    }

    getPath(url: URL): Path {
        const urlToPath = jsurl.fileURLToPath(url);
        return this.theFileSystem.getPath(urlToPath);
    }

    getScheme(): string {
        return "file";
    }

    checkAccess(obj: Path, modes: AccessMode[]) {
        modes.forEach((mode) => {
            switch (mode) {
                case AccessMode.READ:
                    return fs.access(obj.toString(), fs.constants.R_OK, err => new AccessDeniedException(obj.toString()))
                case AccessMode.WRITE:
                    return fs.access(obj.toString(), fs.constants.W_OK, err => new AccessDeniedException(obj.toString()))
                case AccessMode.EXECUTE:
                    return fs.access(obj.toString(), fs.constants.X_OK, err => new AccessDeniedException(obj.toString()))
            }
        })
    }

    copy(source: Path, target: Path, options: CopyOption[]) {
    }

    move(source: Path, target: Path, options: CopyOption[]) {
    }

    isHidden(obj: Path): boolean {
        return false;
    }

    isSameFile(obj1: Path, obj2: Path): boolean {
        return false;
    }


}
