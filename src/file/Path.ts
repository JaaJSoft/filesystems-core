import {FileSystem} from "./FileSystem";
import {LinkOption} from "./LinkOption";
import {IllegalArgumentException} from "../exception";
import {Watchable} from "./Watchable";
import {Comparable} from "../Comparable";

/* `Path` is a class that represents a path in a file system. */
export abstract class Path implements Iterable<Path>, Watchable, Comparable<Path> {

    protected constructor() {
        // empty
    }

    public abstract getFileSystem(): FileSystem;

    public abstract isAbsolute(): boolean;

    public abstract getRoot(): Path | null;

    public abstract getFileName(): Path | null;

    /**
     * It returns the parent path of the current path
     * @returns The parent of the path.
     */
    public abstract getParent(): Path | null;

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

    /* Checking if the path starts with the given string. */
    public startsWithStr(other: string): boolean {
        const path = this.getFileSystem().getPath(other);
        if (path) {
            return this.startsWith(path);
        }
        return false;
    }

    public abstract endWith(other: Path): boolean;

    public endWithStr(other: string): boolean {
        const path = this.getFileSystem().getPath(other);
        return this.endWith(path);
    }

    public abstract normalize(): Path;

    // -- resolution and relativization --

    public abstract resolve(other: Path): Path;

    /**
     * `resolveFromString` takes a string and returns a `Path` object
     * @param {string} other - The path to resolve against this path.
     * @returns A Path object
     */
    public resolveFromString(other: string): Path | null {
        const path = this.getFileSystem().getPath(other);
        if (path) {
            return this.resolve(path);
        }
        return null;
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
            throw new IllegalArgumentException("null param");
        const parent = this.getParent();
        return (parent == null) ? other : parent.resolve(other);
    }

    /**
     * Resolves the given path against this path's parent.
     * @param {string} other - The other path to resolve against this one.
     * @returns A Path object.
     */
    public resolveSiblingFromString(other: string): Path | null {
        const path = this.getFileSystem().getPath(other);
        if (path) {
            return this.resolveSibling(path);
        }
        return null;
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

    /* Converting the path to a URL. */
    public abstract toURL(): URL;

    /* Converting the path to an absolute path. */
    public abstract toAbsolutePath(): Path;

    public abstract toRealPath(options?: LinkOption[]): Path;

    public abstract equals(other: Path | null | undefined): boolean;

    abstract compareTo(other: Path): number;

    abstract toString(): string;

    abstract [Symbol.iterator](): Iterator<Path>;
}
