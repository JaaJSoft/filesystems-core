import {Path} from "../../Path";
import {FileSystem} from "../../FileSystem";
import {LinkOption} from "../../LinkOption";
import {LocalPathType} from "./LocalPathType";
import * as pathFs from "path";
import * as jsurl from "url"
import fs from "fs"
import {ProviderMismatchException} from "../../ProviderMismatchException";
import {IllegalArgumentException} from "../../../exception/IllegalArgumentException";

export class LocalPath extends Path {

    // root component (may be empty)
    private readonly root: string;
    private readonly path: string;
    private readonly type: LocalPathType;
    private readonly fileSystem: FileSystem;
    // offsets into name components (computed lazily)
    private offsets: number[]

    constructor(fileSystem: FileSystem, type: LocalPathType, root: string, path: string) {
        super();
        this.fileSystem = fileSystem;
        this.type = type;
        this.root = root;
        this.path = path;
    }

    static parse(fs: FileSystem, path: string) {
        let parse = pathFs.parse(path);
        return new LocalPath(fs, undefined, parse.root, parse.dir); // TODO set type
    }

    static toLocalPath(path: Path): LocalPath {
        if (path == null)
            throw new TypeError(null); // TODO find a better way
        if (!(path instanceof LocalPath)) {
            throw new ProviderMismatchException();
        }
        return path as LocalPath;
    }

    private emptyPath(): LocalPath {
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", "");
    }

    getFileName(): Path {
        const len = this.path.length;
        // represents empty path
        if (len == 0)
            return this;
        // represents root component only
        if (this.root.length == len)
            return null;
        let off = this.path.lastIndexOf('\\');
        if (off < this.root.length)
            off = this.root.length;
        else
            off++;
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", this.path.substring(off));
    }

    getFileSystem(): FileSystem {
        return this.fileSystem;
    }

    getName(index: number): Path {
        this.initOffsets();
        if (index < 0 || index >= this.offsets.length)
            throw new IllegalArgumentException();
        return new LocalPath(this.getFileSystem(), LocalPathType.RELATIVE, "", this.elementAsString(index));
    }

    getNameCount(): number {
        this.initOffsets();
        return this.offsets.length;
    }

    getParent(): Path {
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

    getRoot(): Path {
        if (this.root.length === 0)
            return null;
        return new LocalPath(this.getFileSystem(), this.type, this.root, this.root);
    }

    getType(): LocalPathType {
        return this.type
    }

    isAbsolute(): boolean {
        return this.type === LocalPathType.ABSOLUTE || this.type === LocalPathType.UNC
    }

    private isEmpty(): boolean {
        return this.path.length == 0;
    }

    normalize(): Path {
        return undefined;
    }

    relativize(other: Path): Path {
        return undefined;
    }

    resolve(other: Path): Path {
        return undefined;
    }

    startsWith(obj: Path): boolean {
        let other: LocalPath;
        try {
            other = LocalPath.toLocalPath(obj);
        } catch (e) {
            if (e instanceof ProviderMismatchException) {
                return false;
            }
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

    endWith(obj: Path): boolean {
        let other: LocalPath;
        try {
            other = LocalPath.toLocalPath(obj);
        } catch (e) {
            if (e instanceof ProviderMismatchException) {
                return false;
            }
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
            // FIXME: should compare in uppercase
            if (thisElement.toUpperCase() !== otherElement.toUpperCase())
                return false;
        }
        return true;
    }

    subpath(beginIndex: number, endIndex: number): Path {
        this.initOffsets();
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

    toAbsolutePath(): Path {
        if (this.isAbsolute()) {
            return this;
        }
        const absolutePath = pathFs.parse(pathFs.resolve(this.path));
        return this.pathFromJsPath(absolutePath, LocalPathType.ABSOLUTE);
    }

    toRealPath(options?: LinkOption[]): Path {
        // TODO handle options
        const realPath = pathFs.parse(fs.realpathSync(this.path));
        return this.pathFromJsPath(realPath, LocalPathType.ABSOLUTE);
    }

    toURL(): URL {
        return jsurl.pathToFileURL(this.toAbsolutePath().toString());
    }

    toString(): string {
        return this.path;
    }

    compareTo(other: Path): number {
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

    equals(other: Path): boolean {
        if ((other != null) && (other instanceof LocalPath)) {
            return this.compareTo((other as Path)) == 0;
        }
        return false;
    }

    private pathFromJsPath(path: pathFs.ParsedPath, pathType: LocalPathType) {
        return new LocalPath(this.getFileSystem(), pathType, path.root, path.dir);
    }

    // generate offset array
    private initOffsets() {
        if (this.offsets == null) {
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
            if (this.offsets == null)
                this.offsets = list;

        }
    }

    private elementAsString(i: number) {
        this.initOffsets();
        if (i == (this.offsets.length - 1))
            return this.path.substring(this.offsets[i]);
        return this.path.substring(this.offsets[i], this.offsets[i + 1] - 1);
    }

    [Symbol.iterator](): Iterator<Path, any, undefined> {
        throw new Error("Method not implemented.");
    }
}