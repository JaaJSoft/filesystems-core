import {Path} from "../../Path";
import {FileSystem} from "../../FileSystem";
import {LinkOption} from "../../LinkOption";
import {LocalPathType} from "./LocalPathType";
import * as pathFs from "path";
import * as jsurl from "url"
import fs from "fs"
import {ProviderMismatchException} from "../../exception/ProviderMismatchException";
import {IllegalArgumentException} from "../../../exception/IllegalArgumentException";
import {NullPointerException} from "../../../exception";

/* `LocalPath` is a class that represents a path on the local file system. */
export class LocalPath extends Path {

    // root component (may be empty)
    private readonly root: string;
    private readonly path: string;
    private readonly type: LocalPathType;
    private readonly fileSystem: FileSystem;
    // offsets into name components (computed lazily)
    private offsets: number[] | undefined

    public constructor(fileSystem: FileSystem, type: LocalPathType, root: string, path: string) {
        super();
        this.fileSystem = fileSystem;
        this.type = type;
        this.root = root;
        this.path = path;
    }

    /**
     * It takes a path and returns a LocalPath object
     * @param {FileSystem} fileSystem - The file system that the path is on.
     * @param {string} path - The path to parse.
     * @returns A new LocalPath object.
     */
    public static parse(fileSystem: FileSystem, path: string) {
        let parse = pathFs.parse(path);
        return new LocalPath(fileSystem, LocalPathType.RELATIVE, parse.root, path); // TODO set type
    }

    public static toLocalPath(path: Path): LocalPath {
        if (path == null)
            throw new NullPointerException(); // TODO find a better way
        if (!(path instanceof LocalPath)) {
            throw new ProviderMismatchException();
        }
        return path;
    }

    // @ts-ignore
    private emptyPath(): LocalPath {
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", "");
    }

    /**
     * > It returns the file name of the path
     * @returns The file name of the path.
     */
    public getFileName(): Path | null {
        const len = this.path.length;
        // represents empty path
        if (len == 0)
            return this;
        // represents root component only
        if (this.root.length == len)
            return null;
        let off = this.path.lastIndexOf(this.fileSystem.getSeparator());
        if (off < this.root.length)
            off = this.root.length;
        else
            off++;
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", this.path.substring(off));
    }

    /* It returns the file system that the path is on. */
    public getFileSystem(): FileSystem {
        return this.fileSystem;
    }

    public getName(index: number): Path {
        this.offsets = this.initOffsets();
        if (index < 0 || index >= this.offsets.length)
            throw new IllegalArgumentException();
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", this.elementAsString(index));
    }

    public getNameCount(): number {
        this.offsets = this.initOffsets();
        return this.offsets.length;
    }

    public getParent(): Path | null {
        // represents root component only
        if (this.root.length == this.path.length)
            return null;
        const off = this.path.lastIndexOf('\\');
        if (off < this.root.length)
            return this.getRoot();
        else
            return new LocalPath(this.getFileSystem(),
                this.type,
                this.root,
                this.path.substring(0, off));
    }

    public getRoot(): Path | null {
        if (this.root.length === 0)
            return null;
        return new LocalPath(this.getFileSystem(), this.type, this.root, this.root);
    }

    public getType(): LocalPathType {
        return this.type
    }

    public isAbsolute(): boolean {
        return this.type === LocalPathType.ABSOLUTE || this.type === LocalPathType.UNC
    }

    private isEmpty(): boolean {
        return this.path.length == 0;
    }

    public normalize(): Path {
        throw new Error("Method not implemented.");
    }

    public relativize(other: Path): Path {
        throw new Error("Method not implemented.");
    }

    public resolve(other: Path): Path {
        throw new Error("Method not implemented.");
    }

    public startsWith(obj: Path): boolean {
        let other: LocalPath | null = null;
        try {
            other = LocalPath.toLocalPath(obj);
        } catch (e) {
            if (e instanceof ProviderMismatchException) {
                return false;
            }
        }
        if (!other) {
            return false;
        }

        // if this path has a root component the given path's root must match
        if (this.root.toUpperCase() !== other.root.toUpperCase()) {
            return false;
        }

        // empty path starts with itself
        if (other.isEmpty()) {
            return this.isEmpty();
        }

        // roots match so compare elements
        let thisCount = this.getNameCount();
        let otherCount = other.getNameCount();
        if (otherCount <= thisCount) {
            while (--otherCount >= 0) {
                const thisElement = this.elementAsString(otherCount);
                const otherElement = other.elementAsString(otherCount);
                if (thisElement.toUpperCase() !== otherElement.toUpperCase()) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    public endWith(obj: Path): boolean {
        let other: LocalPath | null = null;
        try {
            other = LocalPath.toLocalPath(obj);
        } catch (e) {
            if (e instanceof ProviderMismatchException) {
                return false;
            }
        }
        if (!other) {
            return false;
        }
        // other path is longer
        if (other.path.length > this.path.length) {
            return false;
        }

        // empty path ends in itself
        if (other.isEmpty()) {
            return this.isEmpty();
        }

        const thisCount = this.getNameCount();
        let otherCount = other.getNameCount();

        // given path has more elements that this path
        if (otherCount > thisCount) {
            return false;
        }

        // compare roots
        if (other.root.length > 0) {
            if (otherCount < thisCount)
                return false;
            if (this.root.toUpperCase() !== other.root.toUpperCase())
                return false;
        }

        // match last 'otherCount' elements
        const off = thisCount - otherCount;
        while (--otherCount >= 0) {
            const thisElement = this.elementAsString(off + otherCount);
            const otherElement = other.elementAsString(otherCount);
            if (thisElement.toUpperCase() !== otherElement.toUpperCase())
                return false;
        }
        return true;
    }

    public subpath(beginIndex: number, endIndex: number): Path {
        this.offsets = this.initOffsets();
        if (beginIndex < 0)
            throw new IllegalArgumentException();
        if (beginIndex >= this.offsets.length)
            throw new IllegalArgumentException();
        if (endIndex > this.offsets.length)
            throw new IllegalArgumentException();
        if (beginIndex >= endIndex)
            throw new IllegalArgumentException();
        let path = "";
        for (let i = beginIndex; i < endIndex; i++) {
            path += this.elementAsString(i);
            if (i != (endIndex - 1))
                path += "\\";
        }
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", path);
    }

    public toAbsolutePath(): Path {
        if (this.isAbsolute()) {
            return this;
        }
        const resolvedPath = pathFs.resolve(this.path);
        const absolutePath = pathFs.parse(resolvedPath);
        return this.pathFromJsPath(absolutePath, resolvedPath, LocalPathType.ABSOLUTE);
    }

    public toRealPath(options?: LinkOption[]): Path {
        // TODO handle options
        const realpath = fs.realpathSync(this.path);
        const realPathParsed = pathFs.parse(realpath);
        return this.pathFromJsPath(realPathParsed, realpath, LocalPathType.ABSOLUTE);
    }

    public toURL(): URL {
        return jsurl.pathToFileURL(this.toAbsolutePath().toString());
    }

    public toString(): string {
        return this.path;
    }

    public compareTo(other: Path): number {
        const s1: string = this.path;
        const s2: string = (other as LocalPath).path;
        const n1 = s1.length;
        const n2 = s2.length;
        const min = Math.min(n1, n2);
        for (let i = 0; i < min; i++) {
            let c1: string = s1.charAt(i);
            let c2: string = s2.charAt(i);
            if (c1 != c2) {
                c1 = c1.toUpperCase();
                c2 = c2.toUpperCase();
                if (c1 != c2) {
                    return c1.charCodeAt(0) - c2.charCodeAt(0);
                }
            }
        }
        return n1 - n2;
    }

    public equals(other: Path): boolean {
        if ((other != null) && (other instanceof LocalPath)) {
            return this.compareTo((other as Path)) == 0;
        }
        return false;
    }

    private pathFromJsPath(path: pathFs.ParsedPath, resolvedPath: string = "", pathType: LocalPathType) {
        return new LocalPath(this.getFileSystem(), pathType, path.root, this.path);
    }

    // generate offset array
    private initOffsets(): number[] {
        if (!this.offsets) {
            const list = [];
            if (this.isEmpty()) {
                // empty path considered to have one name element
                list.push(0);
            } else {
                let start = this.root.length;
                let off = this.root.length;
                while (off < this.path.length) {
                    if (this.path.charAt(off) != '\\') {
                        off++;
                    } else {
                        list.push(start);
                        start = ++off;
                    }
                }
                if (start != off)
                    list.push(start);
            }
            if (!this.offsets)
                return list;

        }
        return this.offsets;
    }

    private elementAsString(i: number) {
        this.offsets = this.initOffsets();
        if (i == (this.offsets.length - 1))
            return this.path.substring(this.offsets[i]);
        return this.path.substring(this.offsets[i], this.offsets[i + 1] - 1);
    }

    [Symbol.iterator](): Iterator<Path, any, undefined> {
        throw new Error("Method not implemented.");
    }
}
