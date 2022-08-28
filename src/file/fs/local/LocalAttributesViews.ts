import {AttributeViewName, BasicFileAttributes, BasicFileAttributeView, FileTime} from "../../attribute";
import {LocalPath} from "./LocalPath";
import fs from "fs";

export class LocalBasicFileAttributesView implements BasicFileAttributeView {
    private readonly path: LocalPath;
    private readonly followsLinks: boolean;

    constructor(path: LocalPath, followsLinks: boolean) {
        this.path = path;
        this.followsLinks = followsLinks;
    }

    public name(): AttributeViewName {
        return "basic";
    }

    public readAttributes(): BasicFileAttributes {
        const options: { bigint: boolean } = {bigint: true};
        const p: string = this.path.toString();
        const stats = (this.followsLinks ? fs.statSync(p, options) : fs.lstatSync(p, options)) as fs.BigIntStats;
        return new class implements BasicFileAttributes {
            public creationTime(): FileTime {
                return FileTime.fromMillis(Number(stats.birthtimeMs));
            }

            public fileKey(): Object {
                return stats.dev + stats.ino;
            }

            public isDirectory(): boolean {
                return stats.isDirectory();
            }

            public isOther(): boolean {
                return !this.isDirectory() && !this.isRegularFile() && !this.isSymbolicLink();
            }

            public isRegularFile(): boolean {
                return stats.isFile();
            }

            public isSymbolicLink(): boolean {
                return stats.isSymbolicLink();
            }

            public lastAccessTime(): FileTime {
                return FileTime.fromMillis(Number(stats.atimeMs));
            }

            public lastModifiedTime(): FileTime {
                return FileTime.fromMillis(Number(stats.mtimeMs));
            }

            public size(): bigint {
                return stats.size;
            }
        };
    }

    public setTimes(lastModifiedTime?: FileTime, lastAccessTime?: FileTime, createTime?: FileTime): void {
        if (createTime) {
            console.warn("Node provider : not possible to update creationTime");
        }
        const fileAttributes: BasicFileAttributes = this.readAttributes();
        fs.lutimesSync(
            this.path.toString(),
            lastAccessTime ? lastAccessTime.toMillis() : fileAttributes.lastAccessTime().toMillis(),
            lastModifiedTime ? lastModifiedTime.toMillis() : fileAttributes.lastModifiedTime().toMillis(),
        );
    }

}
