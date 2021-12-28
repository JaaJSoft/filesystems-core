import {FileSystem} from "../../FileSystem";
import {FileStore} from "../../FileStore";
import {PathMatcher} from "../../PathMatcher";
import {Path} from "../../Path";
import {UserPrincipalLookupService} from "../../attribute/UserPrincipalLookupService";
import {FileSystemProvider} from "../../spi/FileSystemProvider";

export class LocalFileSystem extends FileSystem {

    constructor() {
        super();
    }

    close() {
    }

    getFileStores(): Iterable<FileStore> {
        return undefined;
    }

    getPath(first: string, more?: string[]) {
    }

    getPathMatcher(syntaxAndPattern: string): PathMatcher {
        return undefined;
    }

    getRootDirectories(): Iterable<Path> {
        return undefined;
    }

    getSeparator(): string {
        return "";
    }

    getUserPrincipalLookupService(): UserPrincipalLookupService {
        return undefined;
    }

    isOpen(): boolean {
        return false;
    }

    isReadOnly(): boolean {
        return false;
    }

    provider(): FileSystemProvider {
        return undefined;
    }

    supportedFileAttributeViews(): Set<string> {
        return undefined;
    }
}