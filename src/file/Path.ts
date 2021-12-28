import {FileSystem} from "./FileSystem";
import {LinkOption} from "./LinkOption";
import {FileSystems} from "./FileSystems";
import {IllegalArgumentException} from "../exception/IllegalArgumentException";
import {FileSystemNotFoundException} from "./FileSystemNotFoundException";
import {installedProviders} from "./spi/FileSystemProviders";

export abstract class Path {

    protected constructor() {
    }

    public static of(first: string, more?: string[]): Path {
        return FileSystems.getDefault().getPath(first, more);
    }

    public static ofURL(url: URL): Path {
        const scheme = url.protocol.toLowerCase();
        if (scheme === null) {
            throw new IllegalArgumentException("Missing scheme");
        }
        if (scheme.toLowerCase() === "file") {
            return FileSystems.getDefault().provider().getPath(url);
        }
        for (const provider of installedProviders()) {
            if (provider.getScheme() === scheme) {
                return provider.getPath(url);
            }
        }
        throw new FileSystemNotFoundException(`Provider "${scheme}" not installed`)
    }

    public abstract getFileSystem(): FileSystem;

    public abstract isAbsolute(): boolean;

    public abstract getRoot(): Path;

    public abstract getFileName(): Path;

    public abstract getParent(): Path;

    public abstract getNameCount(): number;

    public abstract getName(index: number): Path;

    /**
     * Returns a relative {@code Path} that is a subsequence of the name
     * elements of this path.
     *
     * <p> The {@code beginIndex} and {@code endIndex} parameters specify the
     * subsequence of name elements. The name that is <em>closest</em> to the root
     * in the directory hierarchy has index {@code 0}. The name that is
     * <em>farthest</em> from the root has index {@link #getNameCount
     * count}{@code -1}. The returned {@code Path} object has the name elements
     * that begin at {@code beginIndex} and extend to the element at index {@code
     * endIndex-1}.
     *
     * @param   beginIndex
     *          the index of the first element, inclusive
     * @param   endIndex
     *          the index of the last element, exclusive
     *
     * @return  a new {@code Path} object that is a subsequence of the name
     *          elements in this {@code Path}
     *
     * @throws  IllegalArgumentException
     *          if {@code beginIndex} is negative, or greater than or equal to
     *          the number of elements. If {@code endIndex} is less than or
     *          equal to {@code beginIndex}, or larger than the number of elements.
     */
    public abstract subpath(beginIndex: number, endIndex: number): Path;

    public abstract startsWith(other: Path): boolean;

    public startsWithStr(other: string): boolean {
        return this.startsWith(this.getFileSystem().getPath(other))
    }

    public abstract endWith(other: Path): boolean;

    public endWithStr(other: string): boolean {
        return this.endWith(this.getFileSystem().getPath(other))
    }

    public abstract normalize(): Path;

    // -- resolution and relativization --

    public abstract resolve(other: Path): Path;

    public resolveFromString(other: string): Path {
        return this.resolve(this.getFileSystem().getPath(other))
    }

    /**
     * Resolves the given path against this path's {@link #getParent parent}
     * path. This is useful where a file name needs to be <i>replaced</i> with
     * another file name. For example, suppose that the name separator is
     * "{@code /}" and a path represents "{@code dir1/dir2/foo}", then invoking
     * this method with the {@code Path} "{@code bar}" will result in the {@code
     * Path} "{@code dir1/dir2/bar}". If this path does not have a parent path,
     * or {@code other} is {@link #isAbsolute() absolute}, then this method
     * returns {@code other}. If {@code other} is an empty path then this method
     * returns this path's parent, or where this path doesn't have a parent, the
     * empty path.
     *
     * @implSpec
     * The default implementation is equivalent for this path to:
     * <pre>{@code
     *     (getParent() == null) ? other : getParent().resolve(other);
     * }</pre>
     * unless {@code other == null}, in which case a
     * {@code NullPointerException} is thrown.
     *
     * @param   other
     *          the path to resolve against this path's parent
     *
     * @return  the resulting path
     *
     * @see #resolve(Path)
     */
    public resolveSibling(other: Path): Path {
        if (other == null)
            throw new Error("null"); // TODO add proper exception
        const parent = this.getParent();
        return (parent == null) ? other : parent.resolve(other);
    }

    public resolveSiblingFromString(other: string): Path {
        return this.resolveSibling(this.getFileSystem().getPath(other));
    }

    /**
     * Constructs a relative path between this path and a given path.
     *
     * <p> Relativization is the inverse of {@link #resolve(Path) resolution}.
     * This method attempts to construct a {@link #isAbsolute relative} path
     * that when {@link #resolve(Path) resolved} against this path, yields a
     * path that locates the same file as the given path. For example, on UNIX,
     * if this path is {@code "/a/b"} and the given path is {@code "/a/b/c/d"}
     * then the resulting relative path would be {@code "c/d"}. Where this
     * path and the given path do not have a {@link #getRoot root} component,
     * then a relative path can be constructed. A relative path cannot be
     * constructed if only one of the paths have a root component. Where both
     * paths have a root component then it is implementation dependent if a
     * relative path can be constructed. If this path and the given path are
     * {@link #equals equal} then an <i>empty path</i> is returned.
     *
     * <p> For any two {@link #normalize normalized} paths <i>p</i> and
     * <i>q</i>, where <i>q</i> does not have a root component,
     * <blockquote>
     *   <i>p</i>{@code .relativize(}<i>p</i>
     *   {@code .resolve(}<i>q</i>{@code )).equals(}<i>q</i>{@code )}
     * </blockquote>
     *
     * <p> When symbolic links are supported, then whether the resulting path,
     * when resolved against this path, yields a path that can be used to locate
     * the {@link Files#isSameFile same} file as {@code other} is implementation
     * dependent. For example, if this path is  {@code "/a/b"} and the given
     * path is {@code "/a/x"} then the resulting relative path may be {@code
     * "../x"}. If {@code "b"} is a symbolic link then is implementation
     * dependent if {@code "a/b/../x"} would locate the same file as {@code "/a/x"}.
     *
     * @param   other
     *          the path to relativize against this path
     *
     * @return  the resulting relative path, or an empty path if both paths are
     *          equal
     *
     * @throws  IllegalArgumentException
     *          if {@code other} is not a {@code Path} that can be relativized
     *          against this path
     */
    public abstract relativize(other: Path): Path;

    public abstract toURL(): URL;

    public abstract toAbsolutePath(): Path;

    public abstract toRealPath(options?: LinkOption[]);

    public abstract equals(other: Path): boolean;

    public abstract compareTo(other: Path): number;
}
