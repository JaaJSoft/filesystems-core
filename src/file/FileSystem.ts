import {FileSystemProvider} from "./spi";
import {Path} from "./Path";
import {FileStore} from "./FileStore";
import {PathMatcher} from "./PathMatcher";
import {AttributeViewName, UserPrincipalLookupService} from "./attribute";
import {AsyncCloseable} from "../Closeable";
import {WatchService} from "./WatchService";

/* A common interface for all file systems. */
export abstract class FileSystem implements AsyncCloseable {

    protected constructor() {
        //
    }

    public abstract provider(): FileSystemProvider;

    public abstract close(): Promise<void>

    public abstract isOpen(): boolean;

    public abstract isReadOnly(): boolean;

    /* It returns the separator used by the file system. */
    public abstract getSeparator(): string;

    public abstract getRootDirectories(): Promise<Iterable<Path>>;

    public abstract getFileStores(): Promise<Iterable<FileStore>>;

    public abstract supportedFileAttributeViews(): Set<AttributeViewName>;

    public abstract getPathMatcher(syntaxAndPattern: string): PathMatcher;

    public abstract getUserPrincipalLookupService(): UserPrincipalLookupService;

    public abstract getPath(first: string, more?: string[]): Path;

    public abstract newWatchService(): WatchService;

}
