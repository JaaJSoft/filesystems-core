import {FileSystemProvider} from "../../spi";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";
import * as fs from "fs";
import {AccessMode} from "../../AccessMode";
import {CopyOption} from "../../CopyOption";
import {AccessDeniedException} from "../../exception";
import {OpenOption} from "../../OpenOption";
import {BasicFileAttributes, FileAttribute, FileAttributeView} from "../../attribute";
import {FileStore} from "../../FileStore";
import {LinkOption} from "../../LinkOption";
import {DirectoryStream} from "../../DirectoryStream";
import {ReadableStream, TextDecoderStream, TextEncoderStream} from "node:stream/web";
import {StandardOpenOption} from "../../StandardOpenOption";

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

    public getFileSystem(url: URL): FileSystem | null {
        const path = this.theFileSystem.getPath(url.pathname);
        if (path)
            return path.getFileSystem();
        return null;
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

    private static readonly BUFFER_SIZE: number = 8192;

    public override newTextDecoder(charsets: string): TextDecoderStream {
        return new TextDecoderStream(charsets);
    }

    public override newTextEncoder(): TextEncoderStream {
        return new TextEncoderStream();
    }

    private static start(path: Path, controller: ReadableStreamDefaultController<Int8Array> | WritableStreamDefaultController, options?: OpenOption[]): number {
        let fd: number = -1;
        try {
            fd = fs.openSync(path.toString(), this.mapOptionsToFlags(options)); // TODO options
        } catch (e) {
            controller.error(e);
        }
        return fd;
    }

    private static mapOptionsToFlags(options: OpenOption[] = [StandardOpenOption.READ]): string {
        return "r+";
        /* let flags: number[] = options.flatMap(value => {
             switch (value) {
                 case StandardOpenOption.READ:
                     return [fs.constants.O_RDONLY];
                 case StandardOpenOption.WRITE:
                     return [fs.constants.O_WRONLY];
                 case StandardOpenOption.APPEND:
                     return [fs.constants.O_APPEND];
                 case StandardOpenOption.TRUNCATE_EXISTING:
                     return [fs.constants.O_TRUNC];
                 case StandardOpenOption.CREATE:
                     return [fs.constants.O_CREAT];
                 case StandardOpenOption.CREATE_NEW:
                     return [fs.constants.O_CREAT, fs.constants.O_EXCL];
                 case StandardOpenOption.SYNC:
                     return [fs.constants.O_SYNC];
                 case StandardOpenOption.DSYNC:
                     return [fs.constants.O_DSYNC];
                 case LinkOption.NOFOLLOW_LINKS:
                     return [fs.constants.O_NOFOLLOW];
                 default:
                     return [];
             }
         });
         if (flags.length === 1) {
             return String(flags[0]);
         }
         return String(flags.reduce((previousValue, currentValue) => previousValue | currentValue));*/
    }

    private static close(fd: number): void {
        fs.closeSync(fd);
    }

    protected newInputStreamImpl(path: Path, options?: OpenOption[]): ReadableStream<Int8Array> {
        let fd: number = -1;
        return new ReadableStream<Int8Array>({
            start: controller => {
                fd = LocalFileSystemProvider.start(path, controller, options);
            },
            pull: controller => {
                try {
                    let buffer: Int8Array = new Int8Array(LocalFileSystemProvider.BUFFER_SIZE);
                    const bytesRead: number = fs.readSync(fd, buffer, 0, LocalFileSystemProvider.BUFFER_SIZE, null);
                    if (bytesRead > 0) {
                        controller.enqueue(buffer.slice(0, bytesRead));
                    } else {
                        controller.close();
                    }
                } catch (e) {
                    controller.error(e);
                }
            },
            cancel: _ => LocalFileSystemProvider.close(fd),
        });
    }

    protected newOutputStreamImpl(path: Path, options?: OpenOption[]): WritableStream<Int8Array> {
        let fd: number = -1;
        return new WritableStream<Int8Array>({
            start: controller => {
                fd = LocalFileSystemProvider.start(path, controller, options);
            },
            write: (chunk, controller) => {
                try {
                    fs.writeSync(fd, chunk);
                } catch (e) {
                    controller.error(e);
                }
            },
            close: () => LocalFileSystemProvider.close(fd),
            abort: reason => {
                LocalFileSystemProvider.close(fd);
                // TODO search if there is another thing to do
            },
        });
        // throw new Error("Method not implemented.");
    }

    public createFile(dir: Path, attrs?: FileAttribute<any>[]): void {
        throw new Error("Method not implemented.");
    }

    public createDirectory(dir: Path, attrs?: FileAttribute<any>[]): void {
        throw new Error("Method not implemented.");
    }

    public newDirectoryStream(dir: Path, acceptFilter: (path: Path) => boolean): DirectoryStream<Path> {
        throw new Error("Method not implemented.");
    }


    public getFileStore(path: Path): FileStore {
        throw new Error("Method not implemented.");
    }

    public checkAccess(obj: Path, modes?: AccessMode[]): void { // TODO finish this
        const accessModesTocheck: AccessMode[] = [];
        if (modes) {
            accessModesTocheck.push(...modes);
        } else {
            accessModesTocheck.push(AccessMode.READ);
        }
        const path = obj.toString();
        try {
            for (let mode of accessModesTocheck) {
                switch (mode) {
                    case AccessMode.READ:
                        fs.accessSync(path, fs.constants.R_OK);
                        break;
                    case AccessMode.WRITE:
                        fs.accessSync(path, fs.constants.W_OK);
                        break;
                    case AccessMode.EXECUTE:
                        fs.accessSync(path, fs.constants.X_OK);
                        break;
                }
            }
        } catch (err) {
            throw new AccessDeniedException(path);
        }

    }

    public copy(source: Path, target: Path, options?: CopyOption[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public move(source: Path, target: Path, options?: CopyOption[]): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public isHidden(obj: Path): boolean {
        throw new Error("Method not implemented.");
    }

    public isSameFile(obj1: Path, obj2: Path): boolean {
        throw new Error("Method not implemented.");
    }

    public delete(path: Path): void {
        fs.rmSync(path.toAbsolutePath().toString());
    }

    public readAttributesByType(path: Path, type?: string, options?: LinkOption[]): BasicFileAttributes {
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
