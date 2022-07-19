import {FileSystemProvider} from "../../spi";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";
import * as fs from "fs";
import {AccessMode} from "../../AccessMode";
import {CopyOption} from "../../CopyOption";
import {AccessDeniedException} from "../../AccessDeniedException";
import {OpenOption} from "../../OpenOption";
import {BasicFileAttributes, FileAttribute, FileAttributeView} from "../../attribute";
import {FileStore} from "../../FileStore";
import {LinkOption} from "../../LinkOption";

/* It's a FileSystemProvider that provides a LocalFileSystem */
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
        return this.theFileSystem.getPath(url.pathname).getFileSystem();
    }

    public getPath(url: URL): Path {
        return this.theFileSystem.getPath(url.pathname);
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

    public createFile(dir: Path, attrs?: FileAttribute<any>[]): void {
        throw new Error("Method not implemented.");
    }

    public createDirectory(dir: Path, attrs?: FileAttribute<any>[]): void {
        throw new Error("Method not implemented.");
    }

    public newDirectoryStream(dir: Path, acceptFilter: (path: Path) => boolean) {
        throw new Error("Method not implemented.");
    }


    public getFileStore(path: Path): FileStore {
        throw new Error("Method not implemented.");
    }

    public checkAccess(obj: Path, modes: AccessMode[]): void { // TODO finish this
        modes.forEach((mode) => {
            switch (mode) {
                case AccessMode.READ:
                    return fs.access(obj.toString(), fs.constants.R_OK, err => {
                        throw new AccessDeniedException(obj.toString(), err.path, err.message);
                    })
                case AccessMode.WRITE:
                    return fs.access(obj.toString(), fs.constants.W_OK, err => {
                        throw new AccessDeniedException(obj.toString(), err.path, err.message);
                    })
                case AccessMode.EXECUTE:
                    return fs.access(obj.toString(), fs.constants.X_OK, err => {
                        throw new AccessDeniedException(obj.toString(), err.path, err.message);
                    })
            }
        })
    }

    public copy(source: Path, target: Path, options?: CopyOption[]): void {
        throw new Error("Method not implemented.");
    }

    public move(source: Path, target: Path, options?: CopyOption[]): void {
        throw new Error("Method not implemented.");
    }

    public isHidden(obj: Path): boolean {
        throw new Error("Method not implemented.");
    }

    public isSameFile(obj1: Path, obj2: Path): boolean {
        throw new Error("Method not implemented.");
    }

    public delete(path: Path): void {
        fs.rmSync(path.toAbsolutePath().toString())
    }

    public readAttributesWithType(path: Path, type?: string, options?: LinkOption[]): BasicFileAttributes {
        throw new Error("Method not implemented.");
    }

    public getFileAttributeView(path: Path, type?: string, options?: LinkOption[]): FileAttributeView {
        throw new Error("Method not implemented.");
    }

    public readAttributes(path: Path, attributes: string, options?: LinkOption[]): Map<string, any> {
        throw new Error("Method not implemented.");
    }

    public setAttribute(path: Path, attribute: string, value: any, options?: LinkOption[]): void {
        throw new Error("Method not implemented.");
    }

}
