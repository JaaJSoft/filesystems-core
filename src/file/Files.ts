import {Path} from "./Path";
import {FileSystemProvider, FileTypeDetectors} from "./spi";
import {OpenOption} from "./OpenOption";
import {
    BasicFileAttributes,
    BasicFileAttributeView,
    FileAttribute,
    FileAttributeView,
    FileOwnerAttributeView,
    FileTime,
    PosixFileAttributes,
    PosixFileAttributeView,
    PosixFilePermission,
    UserPrincipal,
} from "./attribute";
import {DirectoryStream} from "./DirectoryStream";
import {FileSystem} from "./FileSystem";
import {PathMatcher} from "./PathMatcher";
import {FileAlreadyExistsException, FileSystemException, NoSuchFileException} from "./exception";
import {LinkOption} from "./LinkOption";
import {
    IllegalArgumentException,
    IOException,
    NullPointerException,
    SecurityException,
    UnsupportedOperationException,
} from "../exception";
import {AccessMode} from "./AccessMode";
import {CopyOption} from "./CopyOption";
import {StandardCopyOption} from "./StandardCopyOption";
import {StandardOpenOption} from "./StandardOpenOption";
import {copyToForeignTarget, moveToForeignTarget} from "./CopyMoveHelper";
import {Objects} from "../utils";
import {FileStore} from "./FileStore";
import * as assert from "assert";
import {FileVisitOption} from "./FileVisitOption";
import {FileVisitor} from "./FileVisitor";
import {FileTreeWalker, FileTreeWalkerEvent, FileTreeWalkerEventType} from "./FileTreeWalker";
import {FileVisitResult} from "./FileVisitResult";

/* It provides a set of static methods for working with files and directories */
export class Files {

    // buffer size used for reading and writing
    // @ts-ignore
    private static BUFFER_SIZE: number = 8192;

    private constructor() {
        // static
    }

    /**
     * It returns the FileSystemProvider of the given Path
     * @param {Path} path - The path to the file or directory.
     * @returns The provider of the file system.
     */
    private static provider(path: Path): FileSystemProvider {
        return path.getFileSystem().provider();
    }

    public static newInputStream(path: Path, options?: OpenOption[]): ReadableStream {
        return this.provider(path).newInputStream(path, options);
    }

    /**
     * It creates a new output stream.
     * @param {Path} path - The path to the file to open.
     * @param {OpenOption[]} [options] - An array of options specifying how the file is created or opened.
     * @returns A WritableStream
     */
    public static newOutputStream(path: Path, options?: OpenOption[]): WritableStream {
        return this.provider(path).newOutputStream(path, options);
    }

    // -- Directories --

    public static newDirectoryStream(dir: Path): DirectoryStream<Path> {
        return this.provider(dir).newDirectoryStream(dir, _ => true);
    }

    public static newDirectoryStreamFilteredWithGlob(dir: Path, glob: string): DirectoryStream<Path> {
        if (glob === "*") {
            return this.newDirectoryStream(dir);
        }
        const fs: FileSystem = dir.getFileSystem();
        const matcher: PathMatcher = fs.getPathMatcher("glob:" + glob);
        return this.provider(dir).newDirectoryStream(dir, path => matcher.matches(path.getFileName()));
    }

    public static newDirectoryStreamFiltered(dir: Path, filter: (path: Path) => boolean): DirectoryStream<Path> {
        return this.provider(dir).newDirectoryStream(dir, filter);
    }

    // -- Creation and deletion --

    /**
     * `createFile` creates a file at the given path
     * @param {Path} path - The path to the file to be created.
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path
     */
    public static createFile(path: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(path).createFile(path, attrs);
        return path;
    }

    /**
     * > Creates a directory at the given path, with the given attributes
     * @param {Path} dir - Path - The path to the directory to create.
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path of the directory that was created.
     */
    public static createDirectory(dir: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(dir).createDirectory(dir, attrs);
        return dir;
    }

    /**
     * > Create a directory by creating all nonexistent parent directories first
     * @param {Path} dir - Path
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The path of the directory that was created.
     */
    public static createDirectories(dir: Path, attrs?: FileAttribute<any>[]): Path {
        try {
            this.createAndCheckIsDirectory(dir, attrs);
            return dir;
        } catch (x) {
            if (x instanceof FileAlreadyExistsException) {
                // file exists and is not a directory
                throw x;
            }
            // parent may not exist or other reason
        }
        let se: SecurityException | null = null;
        try {
            dir = dir.toAbsolutePath();
        } catch (x) {
            if (x instanceof SecurityException) {
                se = x;
            } else {
                throw x;
            }
        }
        let parent: Path | null = dir.getParent();
        while (parent != null) {
            try {
                this.provider(parent).checkAccess(parent);
                break;
            } catch (x) {
                if (x instanceof NoSuchFileException) {
                    // does not exist
                } else {
                    throw x;
                }
            }
            parent = parent.getParent();
        }
        if (parent === null) {
            if (se === null) {
                throw new FileSystemException(
                    dir.toString(),
                    undefined,
                    "Unable to determine if root directory exists",
                );
            } else {
                throw se;
            }
        }
        // create directories
        let child = parent;
        for (let name of parent.relativize(dir)) {
            child = child.resolve(name);
            this.createAndCheckIsDirectory(child, attrs);
        }
        return dir;
    }

    private static createAndCheckIsDirectory(dir: Path, attrs?: FileAttribute<any>[]) {
        try {
            this.createDirectory(dir, attrs);
        } catch (x) {
            if (x instanceof FileAlreadyExistsException) {
                if (!this.isDirectory(dir, [LinkOption.NOFOLLOW_LINKS])) {
                    throw x;
                }
            } else {
                throw x;
            }
        }
    }

    /**
     * It creates a temporary file in the given path.
     * @param {Path} path - The directory in which the file is to be created.
     * @param {string} prefix - The prefix string to be used in generating the file's name; must be at least three
     * characters long
     * @param {string} suffix - The suffix string to be used in generating the file's name; must be at least three
     * characters long
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     */
    public static createTempFileIn(path?: Path, prefix?: string, suffix?: string | null, attrs?: FileAttribute<any>[]): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * It creates a temporary file in the default temporary-file directory, using the given prefix and suffix to generate
     * the file's name.
     * @param {string} prefix - The prefix string to be used in generating the file's name; must be at least three
     * characters long
     * @param {string} suffix - The suffix string to be used in generating the file's name; may be null, in which case the
     * suffix ".tmp" will be used
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns A Path object
     */
    public static createTempFile(prefix: string, suffix: string, attrs?: FileAttribute<any>[]): Path {
        return this.createTempFileIn(undefined, prefix, suffix, attrs);
    }

    /**
     * It creates a temporary directory in the given path with the given prefix and attributes.
     * @param {Path} path - The path to the directory in which the temporary directory should be created.
     * @param {string} prefix - The prefix of the temporary directory's name.
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     */
    public static createTempDirectoryIn(path?: Path, prefix?: string, attrs?: FileAttribute<any>[]): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * It creates a temporary directory.
     * @param {string} prefix - The prefix string to be used in generating the file's name; must be at least three
     * characters long
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns A Path object
     */
    public static createTempDirectory(prefix: string, attrs?: FileAttribute<any>[]): Path {
        return this.createTempDirectoryIn(undefined, prefix, attrs);
    }

    /**
     * `createSymbolicLink` creates a symbolic link at the given path to the given target
     * @param {Path} link - Path - The path to the symbolic link to create.
     * @param {Path} target - Path - The target of the link
     * @param {FileAttribute<any>[]} [attrs] - FileAttribute<any>[]
     * @returns The link
     */
    public static createSymbolicLink(link: Path, target: Path, attrs?: FileAttribute<any>[]): Path {
        this.provider(link).createSymbolicLink(link, target, attrs);
        return link;
    }

    /**
     * It creates a link to an existing file.
     * @param {Path} link - The path to the link to be created.
     * @param {Path} existing - The path to the file that you want to link to.
     * @returns The link
     */
    public static createLink(link: Path, existing: Path): Path {
        this.provider(link).createLink(link, existing);
        return link;
    }

    /**
     * It deletes the file at the given path.
     * @param {Path} path - The path to the file or directory to delete.
     */
    public static delete(path: Path): void {
        this.provider(path).delete(path);
    }

    /**
     * It deletes a file if it exists.
     * @param {Path} path - The path to the file or directory to delete.
     * @returns A boolean value.
     */
    public static deleteIfExists(path: Path): boolean {
        return this.provider(path).deleteIfExists(path);
    }

    // -- Copying and moving files --

    /**
     * Copy a file or directory from one location to another
     * @param {Path} source - The path to the file or directory to copy.
     * @param {Path} target - Path - The path to the target file or directory.
     * @param {CopyOption[]} [options] - CopyOption[]
     * @returns The target path.
     */
    public static async copy(source: Path, target: Path, options?: CopyOption[]): Promise<Path> {
        const provider = this.provider(source);
        if (this.provider(target) === provider) {
            await provider.copy(source, target, options);
        } else {
            await copyToForeignTarget(source, target, options);
        }
        return target;
    }

    /**
     * Move a file or directory to a new location
     * @param {Path} source - Path - The path to the file or directory to be moved.
     * @param {Path} target - Path - The target path to move the source to.
     * @param {CopyOption[]} [options] - CopyOption[]
     * @returns The target path.
     */
    public static async move(source: Path, target: Path, options?: CopyOption[]): Promise<Path> {
        const provider = this.provider(source);
        if (this.provider(target) === provider) {
            await provider.move(source, target, options);
        } else {
            await moveToForeignTarget(source, target, options);
        }
        return target;
    }

    // -- Miscellaneous --

    /**
     * `readSymbolicLink` returns the target of a symbolic link
     * @param {Path} link - Path
     * @returns A Path object.
     */
    public static readSymbolicLink(link: Path): Path {
        return this.provider(link).readSymbolicLink(link);
    }

    public static getFileStore(path: Path): FileStore {
        return this.provider(path).getFileStore(path);
    }

    public static isSameFile(path: Path, path2: Path): boolean {
        return this.provider(path).isSameFile(path, path2);
    }

    public static isHidden(path: Path): boolean {
        return this.provider(path).isHidden(path);
    }

    public static probeContentType(path: Path): string {
        for (let detector of FileTypeDetectors.installedDetectors) {
            const result = detector.probeContentType(path);
            if (result) {
                return result;
            }
        }
        return FileTypeDetectors.defaultFileTypeDetector.probeContentType(path);
    }

    // -- File Attributes --

    /**
     * It reads the attributes of a file.
     * @param {Path} path - Path
     * @param type
     * @param {LinkOption} [options] - LinkOption
     * @returns BasicFileAttributes
     */
    public static readAttributesByType(path: Path, type?: string, options?: LinkOption[]): BasicFileAttributes {
        return this.provider(path).readAttributesByType(path, type, options);
    }

    /**
     * It returns a map of the attributes of the file at the given path.
     * @param {Path} path - The path to the file or directory.
     * @param {string} attributes - string
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A Map of the attributes of the file at the given path.
     */
    public static readAttributes(path: Path, attributes: string, options?: LinkOption[]): Map<string, any> {
        return this.provider(path).readAttributes(path, attributes, options);
    }

    /**
     * `getFileAttributeView` returns a `FileAttributeView` object that provides access to the attributes of a file
     * @param {Path} path - The path to the file
     * @param {string} [type] - The type of the attribute view.
     * @param {LinkOption[]} [options] - An array of LinkOption objects.
     * @returns A FileAttributeView object.
     */
    public static getFileAttributeView(path: Path, type?: string, options?: LinkOption[]): FileAttributeView {
        return this.provider(path).getFileAttributeView(path, type, options);
    }

    public static setAttribute(path: Path, attribute: string, value: any, options?: LinkOption[]): Path {
        this.provider(path).setAttribute(path, attribute, value, options);
        return path;
    }

    /**
     * Reads the value of a file attribute
     * @param {Path} path - Path
     * @param {string} attribute - The attribute to read.
     * @param {LinkOption[]} [options] - An array of LinkOption objects.
     * @returns The value of the attribute.
     */
    public static getAttribute(path: Path, attribute: string, options?: LinkOption[]): any {
        // only one attribute should be read
        if (attribute.indexOf("*") >= 0 || attribute.indexOf(",") >= 0)
            throw new IllegalArgumentException(attribute);
        const map = this.readAttributes(path, attribute, options);
        assert.equal(map.size, 1);
        let name;
        let pos = attribute.indexOf(":");
        if (pos == -1) {
            name = attribute;
        } else {
            name = (pos == attribute.length) ? "" : attribute.substring(pos + 1);
        }
        return map.get(name);
    }


    /**
     * It returns the permissions of a file.
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A Set of PosixFilePermission
     */
    public static getPosixFilePermissions(path: Path, options?: LinkOption[]): Set<PosixFilePermission> {
        return (this.readAttributesByType(path, "PosixFileAttributes", options) as PosixFileAttributes).permissions();
    }

    /**
     * Set the permissions of a file.
     * @param {Path} path - The path to the file or directory.
     * @param perms - Set<PosixFilePermission>
     * @returns A Path object.
     */
    public static setPosixFilePermissions(path: Path, perms: Set<PosixFilePermission>): Path {
        const view = this.getFileAttributeView(path, "PosixFileAttributeView") as PosixFileAttributeView;
        if (!view) {
            throw new UnsupportedOperationException();
        }
        view.setPermissions(perms);
        return path;
    }

    /**
     * `getOwner` returns the owner of the file at the given path
     * @param {Path} path - The path to the file or directory.
     * @param {LinkOption[]} [options] - An array of LinkOption objects.
     * @returns A UserPrincipal object.
     */
    public static getOwner(path: Path, options?: LinkOption[]): UserPrincipal {
        const view = this.getFileAttributeView(path, "FileOwnerAttributeView", options) as FileOwnerAttributeView;
        if (!view) {
            throw new UnsupportedOperationException();
        }
        return view.getOwner();
    }

    /**
     * It sets the owner of a file.
     * @param {Path} path - The path to the file or directory whose owner you want to set.
     * @param {UserPrincipal} owner - The user principal to set as the owner of the file.
     * @returns A Path object.
     */
    public static setOwner(path: Path, owner: UserPrincipal): Path {
        const view = this.getFileAttributeView(path, "FileOwnerAttributeView") as FileOwnerAttributeView;
        if (!view) {
            throw new UnsupportedOperationException();
        }
        view.setOwner(owner);
        return path;
    }

    /**
     * If the path is a symbolic link, return true. Otherwise, return false
     * @param {Path} path - Path
     * @returns A boolean value.
     */
    public static isSymbolicLink(path: Path): boolean {
        try {
            return this.readAttributesByType(path, undefined, [LinkOption.NOFOLLOW_LINKS]).isSymbolicLink();
        } catch (ioe) {
            return false;
        }
    }

    /**
     * If the path is a directory, return true
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A boolean value.
     */
    public static isDirectory(path: Path, options?: LinkOption[]): boolean {
        try {
            return this.readAttributesByType(path, undefined, options).isDirectory();
        } catch (ioe) {
            return false;
        }
    }

    /**
     * > If the path is a regular file, return true, otherwise return false
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A boolean value.
     */
    public static isRegularFile(path: Path, options?: LinkOption[]): boolean {
        try {
            return this.readAttributesByType(path, undefined, options).isRegularFile();
        } catch (ioe) {
            return false;
        }
    }

    /**
     * It returns the last modified time of a file.
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - An array of LinkOption objects.
     * @returns The last modified time of the file.
     */
    public static getLastModifiedTime(path: Path, options?: LinkOption[]): FileTime {
        return this.readAttributesByType(path, undefined, options).lastModifiedTime();
    }

    /**
     * "Set the last modified time of the file at the given path to the given time."
     *
     * @param {Path} path - The path to the file or directory.
     * @param {FileTime} time - FileTime
     * @returns A Path object.
     */
    public static setLastModifiedTime(path: Path, time: FileTime): Path {
        (this.getFileAttributeView(path, "BasicFileAttributeView") as BasicFileAttributeView)
            .setTimes(time, undefined, undefined);
        return path;
    }

    /**
     * It returns the size of the file.
     * @param {Path} path - Path - the path to the file
     * @returns The size of the file.
     */
    public static size(path: Path): bigint {
        return this.readAttributesByType(path).size();
    }

    // -- Accessibility --

    private static followLinks(options?: LinkOption[]): boolean {
        let followLinks = true;
        if (options) {
            for (let opt of options) {
                if (opt === LinkOption.NOFOLLOW_LINKS) {
                    followLinks = false;
                    continue;
                }
                if (!opt) {
                    throw new NullPointerException();
                }
                throw Error("Should not get here");
            }
        }
        return followLinks;
    }

    /**
     * If the file exists, return true. If the file doesn't exist, return false
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A boolean value.
     */
    public static exists(path: Path, options?: LinkOption[]): boolean {
        try {
            if (this.followLinks(options)) {
                this.provider(path).checkAccess(path);
            } else {
                // attempt to read attributes without following links
                this.readAttributesByType(path, "BasicFileAttributes", [LinkOption.NOFOLLOW_LINKS]);
            }
            // file exists
            return true;
        } catch (x) {
            if (x instanceof IOException) {
                // does not exist or unable to determine if file exists
                return false;
            }
            throw x;
        }
    }

    /**
     * If the file exists, return false. If the file doesn't exist, return true
     * @param {Path} path - Path
     * @param {LinkOption[]} [options] - LinkOption[]
     * @returns A boolean value.
     */
    public static notExists(path: Path, options?: LinkOption[]): boolean {
        try {
            if (this.followLinks(options)) {
                this.provider(path).checkAccess(path);
            } else {
                // attempt to read attributes without following links
                this.readAttributesByType(path, "BasicFileAttributes", [LinkOption.NOFOLLOW_LINKS]);
            }
            // file exists
            return false;
        } catch (x) {
            if (x instanceof NoSuchFileException) {
                // file confirmed not to exist
                return true;
            }
            if (x instanceof IOException) {
                return false;
            }
            throw x;
        }
    }

    /**
     * Check if the file is accessible
     * @param {Path} path - The path to the file or directory
     * @param {AccessMode[]} [modes] - An array of AccessMode objects.
     * @returns A boolean value.
     */
    private static isAccessible(path: Path, modes?: AccessMode[]): boolean {
        try {
            this.provider(path).checkAccess(path, modes);
            return true;
        } catch (x) {
            if (x instanceof IOException) {
                return false;
            }
            throw x;
        }
    }

    /**
     * If the path is accessible for reading, return true, otherwise return false.
     * @param {Path} path - Path
     * @returns A boolean value.
     */
    public static isReadable(path: Path): boolean {
        return this.isAccessible(path, [AccessMode.READ]);
    }

    /**
     * If the path is accessible for writing, return true, otherwise return false.
     * @param {Path} path - Path
     * @returns A boolean value.
     */
    public static isWritable(path: Path): boolean {
        return this.isAccessible(path, [AccessMode.WRITE]);
    }

    /**
     * Returns true if the file or directory at the given path is executable
     * @param {Path} path - The path to the file or directory.
     * @returns A boolean value.
     */
    public static isExecutable(path: Path): boolean {
        return this.isAccessible(path, [AccessMode.EXECUTE]);
    }

    // -- Recursive operations --
    /**
     * It walks a file tree, starting at the given path, and invokes the given visitor for each event
     * @param {Path} start - Path - The starting directory
     * file is visited. A value of MAX_VALUE may be used to indicate that all levels should be visited.
     * @param visitor - FileVisitor<Path>
     * @param {number} maxDepth - The maximum number of directory levels to search. A value of 0 means only the starting
     * @param {FileVisitOption[]} options - FileVisitOption[]
     * @returns The start path.
     */
    public static walkFileTree(start: Path, visitor: FileVisitor<Path>, maxDepth: number = Number.MAX_VALUE, options: FileVisitOption[] = []): Path {
        let walker: FileTreeWalker | undefined = undefined;
        try {
            walker = new FileTreeWalker(options, maxDepth);
            let ev: FileTreeWalkerEvent | undefined = walker.walk(start);
            do {
                let result: FileVisitResult;
                switch (ev?.type()) {
                    case FileTreeWalkerEventType.ENTRY:
                        const ioe = ev.ioeException();
                        if (!ioe) {
                            const attrs = Objects.requireNonNullUndefined(ev.attributes());
                            result = visitor.visitFile(ev.file(), attrs);
                        } else {
                            result = visitor.visitFileFailed(ev.file(), ioe);
                        }
                        break;
                    case FileTreeWalkerEventType.START_DIRECTORY:
                        result = visitor.preVisitDirectory(ev.file(), ev.attributes());

                        // if SKIP_SIBLINGS and SKIP_SUBTREE is returned then
                        // there shouldn't be any more events for the current
                        // directory.
                        if (result === FileVisitResult.SKIP_SUBTREE ||
                            result === FileVisitResult.SKIP_SIBLINGS)
                            walker.pop();
                        break;
                    case FileTreeWalkerEventType.END_DIRECTORY:
                        result = visitor.postVisitDirectory(ev.file(), ev.ioeException());

                        // SKIP_SIBLINGS is a no-op for postVisitDirectory
                        if (result === FileVisitResult.SKIP_SIBLINGS)
                            result = FileVisitResult.CONTINUE;
                        break;
                    default:
                        throw new Error("Should not get here");

                }
                if (Objects.requireNonNullUndefined(result) != FileVisitResult.CONTINUE) {
                    if (result === FileVisitResult.TERMINATE) {
                        break;
                    } else if (result === FileVisitResult.SKIP_SIBLINGS) {
                        walker.skipRemainingSiblings();
                    }
                }
                ev = walker.next();
            } while (Objects.nonNullUndefined(ev));
        } finally {
            if (walker) {
                walker.close();
            }
        }

        return start;
    }


    // -- Utility methods for simple usages --

    /**
     * It copies the contents of a file to another file.
     * @param {ReadableStream} inputStream - ReadableStream
     * @param {Path} target - Path
     * @param {CopyOption[]} [options] - CopyOption[]
     */
    public static async copyFromStream(inputStream: ReadableStream, target: Path, options?: CopyOption[]): Promise<void> {
        Objects.requireNonNullUndefined(inputStream);

        let replaceExisting = false;
        if (options) {
            for (let opt of options) {
                if (opt === StandardCopyOption.REPLACE_EXISTING) {
                    replaceExisting = true;
                } else {
                    if (opt == null) {
                        throw new NullPointerException("options contains 'null'");
                    } else {
                        throw new UnsupportedOperationException(opt + " not supported");
                    }
                }
            }
        }
        let se: SecurityException | null = null;
        if (replaceExisting) {
            try {
                this.deleteIfExists(target);
            } catch (e) {
                if (e instanceof SecurityException) {
                    se = e;
                } else {
                    throw e;
                }
            }
        }
        let outputStream: WritableStream | null = null;
        try {
            outputStream = this.newOutputStream(target, [StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE]);
            await inputStream.pipeTo(outputStream);

        } catch (x) {
            if (x instanceof FileAlreadyExistsException) {
                if (se) {
                    throw se;
                }
                // someone else won the race and created the file
                throw x;
            }
            throw x;
        } finally {
            if (outputStream) {
                await outputStream.close();
            }
        }
    }

    /**
     * Copy the contents of a file to a stream.
     *
     * @param {Path} source - Path - The source file to copy from.
     * @param {WritableStream} outputStream - The stream to write to.
     */
    public static async copyToStream(source: Path, outputStream: WritableStream): Promise<void> {
        Objects.requireNonNullUndefined(outputStream);

        let inputStream: ReadableStream | null = null;
        try {
            inputStream = this.newInputStream(source);
            await inputStream.pipeTo(outputStream);
        } finally {
            if (inputStream) {
                await inputStream.cancel();
            }
        }
    }
}
