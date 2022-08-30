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
import {getPathStats} from "../Helper";
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
                const posixFilePermissions: Set<PosixFilePermission> = new Set<PosixFilePermission>();
                const m = stats.mode;
                if (m & fs.constants.S_IRUSR) posixFilePermissions.add(PosixFilePermission.OWNER_READ);
                if (m & fs.constants.S_IWUSR) posixFilePermissions.add(PosixFilePermission.OWNER_WRITE);
                if (m & fs.constants.S_IXUSR) posixFilePermissions.add(PosixFilePermission.OWNER_EXECUTE);
                if (m & fs.constants.S_IRGRP) posixFilePermissions.add(PosixFilePermission.GROUP_READ);
                if (m & fs.constants.S_IWGRP) posixFilePermissions.add(PosixFilePermission.GROUP_WRITE);
                if (m & fs.constants.S_IXGRP) posixFilePermissions.add(PosixFilePermission.GROUP_EXECUTE);
                if (m & fs.constants.S_IROTH) posixFilePermissions.add(PosixFilePermission.OTHERS_READ);
                if (m & fs.constants.S_IWOTH) posixFilePermissions.add(PosixFilePermission.OTHERS_WRITE);
                if (m & fs.constants.S_IXOTH) posixFilePermissions.add(PosixFilePermission.OTHERS_EXECUTE);
                return posixFilePermissions;
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
        let owner = 0;
        let group = 0;
        let others = 0;
        for (let perm of perms) {
            if (perm === PosixFilePermission.OWNER_READ) {
                owner += 4;
            } else if (perm === PosixFilePermission.OWNER_WRITE) {
                owner += 2;
            } else if (perm === PosixFilePermission.OWNER_EXECUTE) {
                owner += 1;
            } else if (perm === PosixFilePermission.GROUP_READ) {
                group += 4;
            } else if (perm === PosixFilePermission.GROUP_WRITE) {
                group += 2;
            } else if (perm === PosixFilePermission.GROUP_EXECUTE) {
                group += 1;
            } else if (perm === PosixFilePermission.OTHERS_READ) {
                others += 4;
            } else if (perm === PosixFilePermission.OTHERS_WRITE) {
                others += 2;
            } else if (perm === PosixFilePermission.OTHERS_EXECUTE) {
                others += 1;
            }
        }
        fs.chmodSync(this.path.toString(), owner.toString() + group.toString() + others.toString());
    }

    public setTimes(lastModifiedTime?: FileTime, lastAccessTime?: FileTime, createTime?: FileTime): void {
        this.basicAttributesView.setTimes(lastModifiedTime, lastAccessTime, createTime);
    }

}
