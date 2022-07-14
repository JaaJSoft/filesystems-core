import {FileSystem} from "../../FileSystem";
import {FileStore} from "../../FileStore";
import {PathMatcher} from "../../PathMatcher";
import {Path} from "../../Path";
import {UserPrincipalLookupService} from "../../attribute/UserPrincipalLookupService";
import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {LocalFileSystemProvider} from "./LocalFileSystemProvider";
import {UnsupportedOperationException} from "../../../exception/UnsupportedOperationException";
import {LocalPath} from "./LocalPath";
import * as jsPath from "path";

export class LocalFileSystem extends FileSystem {
    private readonly fileSystem: FileSystemProvider;
    private readonly defaultDirectory: string;
    private readonly defaultRoot: string;

    public constructor(provider: LocalFileSystemProvider, dir: string) {
        super();
        this.fileSystem = provider;
        const parsedPath: jsPath.ParsedPath = jsPath.parse(dir);
        this.defaultDirectory = parsedPath.dir;
        this.defaultRoot = parsedPath.root;
    }

    public close() {
        throw new UnsupportedOperationException();
    }

    public getFileStores(): Iterable<FileStore> {
        return undefined;
    }

    public getPath(first: string, more?: string[]): Path {
        if (!first) {
            return null;
        }
        let path: string = "";
        if (!more || more.length === 0) {
            path = first;
        } else {
            for (const segment of more) {
                if (segment.length !== 0) {
                    if (path.length > 0)
                        path += this.getSeparator();
                    path += segment;
                }
            }
        }
        return LocalPath.parse(this, path);
    }

    public getPathMatcher(syntaxAndPattern: string): PathMatcher { // TODO
        throw new Error("Method not implemented.");
    }

    public getRootDirectories(): Iterable<Path> { // TODO find a better way
        return [this.getPath("/")]
    }

    public getSeparator(): string {
        return jsPath.sep
    }

    public getUserPrincipalLookupService(): UserPrincipalLookupService {
        throw new UnsupportedOperationException();
    }

    public isOpen(): boolean {
        return true;
    }

    public isReadOnly(): boolean {
        return false;
    }

    public provider(): FileSystemProvider {
        return this.fileSystem;
    }

    private static readonly supportedFileAttributeViews: Set<string> = new Set<string>(["basic", "dos", "acl", "owner", "user"]);

    public supportedFileAttributeViews(): Set<string> {
        return LocalFileSystem.supportedFileAttributeViews;
    }
}
