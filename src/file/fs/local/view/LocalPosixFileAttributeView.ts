import {
    AttributeViewName,
    BasicFileAttributes,
    FileTime,
    GroupPrincipal,
    PosixFileAttributes,
    PosixFileAttributeView,
    PosixFilePermission,
    UserPrincipal,
} from "../../../attribute";
import {LocalFileOwnerAttributeView} from "./LocalFileOwnerAttributeView";
import {LocalPath} from "../LocalPath";
import {LocalBasicFileAttributesView} from "./LocalBasicFileAttributesView";
import {UnsupportedOperationException} from "../../../../exception";
import {convertPermissionsToPosix, convertPosixPermissions, getPathStats} from "../Helper";
import fs from "fs";
import {LocalGroupPrincipal} from "../LocalGroupPrincipal";

export class LocalPosixFileAttributeView implements PosixFileAttributeView {
    private fileOwnerView: LocalFileOwnerAttributeView;
    private basicAttributesView: LocalBasicFileAttributesView;

    private readonly path: LocalPath;
    private readonly followsLinks: boolean;

    constructor(path: LocalPath, followsLinks: boolean) {
        this.path = path;
        this.followsLinks = followsLinks;
        this.fileOwnerView = new LocalFileOwnerAttributeView(path, followsLinks);
        this.basicAttributesView = new LocalBasicFileAttributesView(path, followsLinks);
    }

    public name(): AttributeViewName {
        return "posix";
    }

    public buildGroupPrincipal(stats: fs.Stats): GroupPrincipal {
        return new LocalGroupPrincipal(stats.gid, null);
    }

    public readAttributes(): PosixFileAttributes {
        const stats = getPathStats(this.path, this.followsLinks);
        const basicFileAttributes: BasicFileAttributes = this.basicAttributesView.buildAttributes(stats);
        const owner: UserPrincipal = this.fileOwnerView.buildOwnerUserPrincipal(stats);
        const group: GroupPrincipal = this.buildGroupPrincipal(stats);
        return new class implements PosixFileAttributes {
            public creationTime(): FileTime {
                return basicFileAttributes.creationTime();
            }

            public fileKey(): Object {
                return basicFileAttributes.fileKey();
            }

            public group(): GroupPrincipal {
                return group;
            }

            public isDirectory(): boolean {
                return basicFileAttributes.isDirectory();
            }

            public isOther(): boolean {
                return basicFileAttributes.isOther();
            }

            public isRegularFile(): boolean {
                return basicFileAttributes.isRegularFile();
            }

            public isSymbolicLink(): boolean {
                return basicFileAttributes.isSymbolicLink();
            }

            public lastAccessTime(): FileTime {
                return basicFileAttributes.lastAccessTime();
            }

            public lastModifiedTime(): FileTime {
                return basicFileAttributes.lastModifiedTime();
            }

            public owner(): UserPrincipal {
                return owner;
            }

            public permissions(): Set<PosixFilePermission> {
                return new Set<PosixFilePermission>(convertPosixPermissions(stats.mode));
            }

            public size(): bigint {
                return basicFileAttributes.size();
            }
        };
    }

    public getOwner(): UserPrincipal {
        return this.fileOwnerView.getOwner();
    }

    public setOwner(owner: UserPrincipal): void {
        this.fileOwnerView.setOwner(owner);
    }

    public setGroup(group: GroupPrincipal): void {
        if (!(group instanceof LocalGroupPrincipal)) {
            throw new UnsupportedOperationException("the type of group must be LocalGroupPrincipal");
        }
        const pathLike = this.path.toString();
        const stats = getPathStats(this.path, this.followsLinks);
        if (this.followsLinks) {
            fs.chownSync(pathLike, stats.uid, group.getGid());
        } else {
            fs.lchownSync(pathLike, stats.uid, group.getGid());
        }
    }

    public setPermissions(perms: Set<PosixFilePermission>): void {
        // TODO check right
        fs.chmodSync(this.path.toString(), convertPermissionsToPosix(perms));
    }

    public setTimes(lastModifiedTime?: FileTime, lastAccessTime?: FileTime, createTime?: FileTime): void {
        this.basicAttributesView.setTimes(lastModifiedTime, lastAccessTime, createTime);
    }

}
