import {FileSystem} from "../../FileSystem";
import {FileStore} from "../../FileStore";
import {PathMatcher} from "../../PathMatcher";
import {Path} from "../../Path";
import {UserPrincipalLookupService} from "../../attribute/UserPrincipalLookupService";
import {FileSystemProvider} from "../../spi/FileSystemProvider";
import {LocalFileSystemProvider} from "./LocalFileSystemProvider";
import {UnsupportedOperationException} from "../../../exception/UnsupportedOperationException";
import {LocalPath} from "./LocalPath";

export class LocalFileSystem extends FileSystem {
    private readonly fileSystem: FileSystemProvider;

    constructor() {
        super();
        this.fileSystem = new LocalFileSystemProvider();
    }

    close() {
        throw new UnsupportedOperationException();
    }

    getFileStores(): Iterable<FileStore> {
        return undefined;
    }

    getPath(first: string, more?: string[]): Path {
        if (!first) {
            return null;
        }
        let path: string = "";
        if (more.length === 0) {
            path = first;
        } else {
            for (const segment of more) {
                if (segment.length !== 0) {
                    if (path.length > 0)
                        path += '\\';
                    path += segment;
                }
            }
        }
        return LocalPath.parse(this, path);
    }

    getPathMatcher(syntaxAndPattern: string): PathMatcher {
        return undefined;
    }

    getRootDirectories(): Iterable<Path> { // TODO find a better way
        return [this.getPath("/")]
    }

    getSeparator(): string {
        return "\\";
    }

    getUserPrincipalLookupService(): UserPrincipalLookupService {
        throw new UnsupportedOperationException();
    }

    isOpen(): boolean {
        return true;
    }

    isReadOnly(): boolean {
        return false;
    }

    provider(): FileSystemProvider {
        return this.fileSystem;
    }

    private static readonly supportedFileAttributeViews: Set<string> = new Set<string>(["basic", "dos", "acl", "owner", "user"]);

    supportedFileAttributeViews(): Set<string> {
        return LocalFileSystem.supportedFileAttributeViews;
    }
}