import {Path} from "../../Path";
import {FileSystem} from "../../FileSystem";
import {LinkOption} from "../../LinkOption";
import {LocalPathType} from "./LocalPathType";
import * as pathFs from "path";
import * as jsurl from "url"
import fs from "fs"
import {ProviderMismatchException} from "../../ProviderMismatchException";

export class LocalPath extends Path {
    // root component (may be empty)
    private readonly root: string;
    private readonly path: string;
    private readonly type: LocalPathType;
    private readonly fileSystem: FileSystem;

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
        return undefined;
    }

    getNameCount(): number {
        return 0;
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

    normalize(): Path {
        return undefined;
    }

    relativize(other: Path): Path {
        return undefined;
    }

    resolve(other: Path): Path {
        return undefined;
    }

    startsWith(other: Path): boolean {
        return false;
    }

    endWith(other: Path): boolean {
        return false;
    }

    subpath(beginIndex: number, endIndex: number): Path {
        return undefined;
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
}