import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";
import * as fs from "fs";
import * as jsPath from "path";
import * as jsurl from "url"
import {AccessMode} from "../../AccessMode";
import {CopyOption} from "../../CopyOption";
import {AccessDeniedException} from "../../AccessDeniedException";
import {OpenOption} from "../../OpenOption";
import {FileAttribute} from "../../attribute/FileAttribute";
import {FileStore} from "../../FileStore";

export class LocalFileSystemProvider extends FileSystemProvider {

    private readonly theFileSystem: LocalFileSystem;

    public constructor() {
        super();
        this.theFileSystem = new LocalFileSystem(this, os.homedir());
    }

    public getTheFileSystem(): LocalFileSystem {
        return this.theFileSystem;
    }

    public getFileSystem(url: URL): FileSystem {
        const urlToPath = jsurl.fileURLToPath(url);
        return this.theFileSystem.getPath(urlToPath).getFileSystem();
    }

    public getPath(url: URL): Path {
        const urlToPath = jsurl.fileURLToPath(url);
        return this.theFileSystem.getPath(urlToPath);
    }

    public getScheme(): string {
        return "file";
    }

    public newFileSystemFromPath(path: Path, env: Map<string, any>): FileSystem {
        return super.newFileSystemFromPath(path, env);
    }

    public newFileSystemFromUrl(url: URL, env: Map<string, any>): FileSystem {
        throw new Error("Method not implemented.");
    }

    protected newInputStreamImpl(path: Path, options?: OpenOption[]): ReadableStream {
        throw new Error("Method not implemented.");
    }

    protected newOutputStreamImpl(path: Path, options?: OpenOption[]): WritableStream {
        throw new Error("Method not implemented.");
    }

    public createFile(dir: Path, attrs?: FileAttribute<any>[]) {
        throw new Error("Method not implemented.");
    }

    public createDirectory(dir: Path, attrs?: FileAttribute<any>[]) {
        throw new Error("Method not implemented.");
    }

    public createDirectories(dir: Path, attrs?: FileAttribute<any>[]) {
        throw new Error("Method not implemented.");
    }

    public getFileStore(path: Path): FileStore {
        throw new Error("Method not implemented.");
    }

    public checkAccess(obj: Path, modes: AccessMode[]) { // TODO finish this
        modes.forEach((mode) => {
            switch (mode) {
                case AccessMode.READ:
                    return fs.access(obj.toString(), fs.constants.R_OK, err => {
                        throw new AccessDeniedException(obj.toString());
                    })
                case AccessMode.WRITE:
                    return fs.access(obj.toString(), fs.constants.W_OK, err => {
                        throw new AccessDeniedException(obj.toString());
                    })
                case AccessMode.EXECUTE:
                    return fs.access(obj.toString(), fs.constants.X_OK, err => {
                        throw new AccessDeniedException(obj.toString());
                    })
            }
        })
    }

    public copy(source: Path, target: Path, options?: CopyOption[]) {
        throw new Error("Method not implemented.");
    }

    public move(source: Path, target: Path, options?: CopyOption[]) {
        throw new Error("Method not implemented.");
    }

    public isHidden(obj: Path): boolean {
        return false;
    }

    public isSameFile(obj1: Path, obj2: Path): boolean {
        return false;
    }

    public delete(path: Path) {
        throw new Error("Method not implemented.");
    }


}
