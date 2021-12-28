import {Path} from "../../Path";
import {FileSystem} from "../../FileSystem";
import {LinkOption} from "../../LinkOption";
import {URI} from "../../../net/URI";

export class LocalPath extends Path {

    constructor() {
        super();
    }

    compareTo(other: Path): number {
        return 0;
    }

    endWith(other: Path): boolean {
        return false;
    }

    equals(other: Path): boolean {
        return false;
    }

    getFileName(): Path {
        return undefined;
    }

    getFileSystem(): FileSystem {
        return undefined;
    }

    getName(index: number): Path {
        return undefined;
    }

    getNameCount(): number {
        return 0;
    }

    getParent(): Path {
        return undefined;
    }

    getRoot(): Path {
        return undefined;
    }

    isAbsolute(): boolean {
        return false;
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

    subpath(beginIndex: number, endIndex: number): Path {
        return undefined;
    }

    toAbsolutePath(): Path {
        return undefined;
    }

    toRealPath(options?: LinkOption[]) {
    }

    toUri(): URI {
        return undefined;
    }

    toLocaleString(): string {
        return super.toLocaleString();
    }


}