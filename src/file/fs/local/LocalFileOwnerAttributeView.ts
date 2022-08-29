import {AttributeViewName, FileOwnerAttributeView, UserPrincipal} from "../../attribute";
import {LocalPath} from "./LocalPath";
import fs from "fs";
import {LocalUserPrincipal} from "./LocalUserPrincipal";
import {UnsupportedOperationException} from "../../../exception";
import {getPathStats} from "./Helper";

export class LocalFileOwnerAttributeView implements FileOwnerAttributeView {
    private readonly path: LocalPath;
    private readonly followsLinks: boolean;

    constructor(path: LocalPath, followsLinks: boolean) {
        this.path = path;
        this.followsLinks = followsLinks;
    }

    public name(): AttributeViewName {
        return "owner";
    }

    public getOwner(): UserPrincipal {
        const stats = getPathStats(this.path, this.followsLinks);
        return new LocalUserPrincipal(stats.uid, null);
    }

    public setOwner(owner: UserPrincipal): void {
        if (!(owner instanceof LocalUserPrincipal)) {
            throw new UnsupportedOperationException("the type of user must be LocalUserPrincipal");
        }
        const pathLike = this.path.toString();
        const stats = getPathStats(this.path, this.followsLinks);
        if (this.followsLinks) {
            fs.chownSync(pathLike, owner.getUid(), stats.gid);
        } else {
            fs.lchownSync(pathLike, owner.getUid(), stats.gid);
        }
    }


}
