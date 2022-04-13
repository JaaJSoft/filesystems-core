import {FileSystemProvider} from "./spi/FileSystemProvider";
import {Path} from "./Path";
import {FileStore} from "./FileStore";
import {PathMatcher} from "./PathMatcher";
import {UserPrincipalLookupService} from "./attribute/UserPrincipalLookupService";

export abstract class FileSystem {

    protected constructor() {
    }

    public abstract provider(): FileSystemProvider;

    public abstract close();

    public abstract isOpen(): boolean;

    public abstract isReadOnly(): boolean;

    /* It returns the separator used by the file system. */
    public abstract getSeparator(): string;

    public abstract getRootDirectories(): Iterable<Path>;

    public abstract getFileStores(): Iterable<FileStore>;

    public abstract supportedFileAttributeViews(): Set<string>;

    public abstract getPathMatcher(syntaxAndPattern: string): PathMatcher;

    public abstract getUserPrincipalLookupService(): UserPrincipalLookupService;

    public abstract getPath(first: string, more?: string[]): Path
}
