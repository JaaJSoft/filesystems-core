import {GroupPrincipal} from "../../attribute";
import {Principal} from "../../../Principal";

export class LocalGroupPrincipal implements GroupPrincipal {
    private readonly groupName: string | null;
    private readonly gid: number;

    constructor(uid: number, accountName: string | null) {
        this.groupName = accountName;
        this.gid = uid;
    }

    public equals(other: Principal): boolean {
        if (!(other instanceof LocalGroupPrincipal)) {
            return false;
        }
        return this.getGid() === other.getGid();
    }

    public getName(): string {
        return this.groupName ? this.groupName : this.gid.toString();
    }


    public getGid(): number {
        return this.gid;
    }

}
