import {FileSystemProviders} from "../../spi";
import {FileSystem} from "../../FileSystem";
import {Path} from "../../Path";
import {LocalFileSystem} from "./LocalFileSystem";
import * as os from "os";
import * as fs from "fs";
import {AccessMode} from "../../AccessMode";
import {CopyOption} from "../../CopyOption";
import {AccessDeniedException, FileSystemAlreadyExistsException} from "../../exception";
import {OpenOption} from "../../OpenOption";
import {
    AttributeViewName,
    BasicFileAttributes,
    BasicFileAttributeView,
    FileAttribute,
    FileAttributeView,
} from "../../attribute";
import {FileStore} from "../../FileStore";
import {LinkOption} from "../../LinkOption";
import {DirectoryStream} from "../../DirectoryStream";
import {ReadableStream, TextDecoderStream, TextEncoderStream, WritableStream} from "node:stream/web";
import {StandardOpenOption} from "../../StandardOpenOption";
import jsurl from "url";
import {IllegalArgumentException, IOException, UnsupportedOperationException} from "../../../exception";
import {LocalDirectoryStream} from "./LocalDirectoryStream";
import {followLinks} from "../../FileUtils";
import {LocalBasicFileAttributesView, LocalFileOwnerAttributeView} from "./view";
import {LocalPath} from "./LocalPath";
import {LocalPosixFileAttributeView} from "./view/LocalPosixFileAttributeView";
import {AbstractFileSystemProvider} from "../abstract";

/* It's a FileSystemProvider that provides a LocalFileSystem */
export class LocalFileSystemProvider extends AbstractFileSystemProvider {

    private readonly theFileSystem: LocalFileSystem;

    public constructor() {
        super();
        this.theFileSystem = new LocalFileSystem(this, os.homedir());
    }

    public getTheFileSystem(): LocalFileSystem {
        return this.theFileSystem;
    }

    public getFileSystem(url: URL): FileSystem {
        this.checkURL(url);
        return this.theFileSystem;
    }

    public getPath(url: URL): Path {
        return this.theFileSystem.getPath(jsurl.fileURLToPath(url));
    }

    public getScheme(): string {
        return "file";
    }

    private checkURL(url: URL): void {
        const scheme = FileSystemProviders.cleanScheme(url.protocol);
        if (scheme !== this.getScheme().toUpperCase())
            throw new IllegalArgumentException("URI does not match this provider");
        const path = url.pathname;
        if (path == null)
            throw new IllegalArgumentException("Path component is undefined");
        if (path !== "/")
            throw new IllegalArgumentException("Path component should be '/'");
    }

    public newFileSystemFromUrl(url: URL, env: Map<string, any>): FileSystem {
        this.checkURL(url);
        throw new FileSystemAlreadyExistsException();
    }

    private static readonly BUFFER_SIZE: number = 8192;

    public override newTextDecoder(charsets: string): TextDecoderStream {
        return new TextDecoderStream(charsets);
    }

    public override newTextEncoder(): TextEncoderStream {
        return new TextEncoderStream();
    }

    private static start(path: Path, controller: ReadableStreamDefaultController<Uint8Array> | WritableStreamDefaultController, options?: OpenOption[]): number {
        let fd: number = -1;
        try {
            fd = fs.openSync(path.toString(), this.mapOptionsToFlags(options)); // TODO options
        } catch (e) {
            controller.error(e);
        }
        return fd;
    }

    private static mapOptionsToFlags(options: OpenOption[] = [StandardOpenOption.READ]): number {
        let flags: number[] = options.flatMap(value => {
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
            return flags[0];
        }
        return flags.reduce((previousValue, currentValue) => previousValue | currentValue);
    }

    private static close(fd: number): void {
        fs.closeSync(fd);
    }

    protected newInputStreamImpl(path: Path, options?: OpenOption[]): ReadableStream<Uint8Array> {
        let fd: number = -1;
        return new ReadableStream<Uint8Array>({
            start: controller => {
                fd = LocalFileSystemProvider.start(path, controller, options);
            },
            pull: controller => {
                try {
                    let buffer: Uint8Array = new Uint8Array(LocalFileSystemProvider.BUFFER_SIZE);
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

    protected newOutputStreamImpl(path: Path, options?: OpenOption[]): WritableStream<Uint8Array> {
        let fd: number = -1;
        return new WritableStream<Uint8Array>({
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
    }

    public createFile(path: Path, attrs?: FileAttribute<any>[]): void {
        fs.writeFileSync(path.toString(), "");
        if (attrs) {
            attrs.forEach(value => this.setAttribute(path, value.name(), value.value()));
        }
    }

    public createDirectory(dir: Path, attrs?: FileAttribute<any>[]): void {
        fs.mkdirSync(dir.toString());
        if (attrs) {
            attrs.forEach(value => this.setAttribute(dir, value.name(), value.value()));
        }
    }

    public newDirectoryStream(dir: Path, acceptFilter: (path?: Path) => boolean = () => true): DirectoryStream<Path> {
        this.checkAccess(dir, [AccessMode.READ]);
        return new LocalDirectoryStream(dir, acceptFilter);
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

    public implDelete(path: Path, failIfNotExists: boolean): boolean {
        this.checkAccess(path, [AccessMode.WRITE]);
        try {
            fs.rmSync(path.toString(), {});
            return true;
        } catch (e) {
            if (failIfNotExists) {
                throw new IOException(path.toString());
            }
            return false;
        }
    }

    public readAttributesByName(path: Path, name?: AttributeViewName, options?: LinkOption[]): BasicFileAttributes {
        switch (name) {
            case "basic":
            case "posix":
                return (this.getFileAttributeView(path, name, options) as BasicFileAttributeView).readAttributes();
            default:
                throw new UnsupportedOperationException();
        }
    }

    public getFileAttributeView(path: Path, name?: AttributeViewName, options?: LinkOption[]): FileAttributeView {
        const follow: boolean = followLinks(options);
        switch (name) {
            case "basic":
                return new LocalBasicFileAttributesView(path as LocalPath, follow);
            case "owner":
                return new LocalFileOwnerAttributeView(path as LocalPath, follow);
            case "posix":
                return new LocalPosixFileAttributeView(path as LocalPath, follow);
            default:
                throw new UnsupportedOperationException();
        }
    }

}
