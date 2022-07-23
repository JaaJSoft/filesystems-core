import {UserPrincipal} from "./UserPrincipal";
import {GroupPrincipal} from "./GroupPrincipal";

export abstract class UserPrincipalLookupService { // TODO Maybe
    protected constructor() {
    }

    public abstract lookupPrincipalByName(name: string): UserPrincipal; // TODO
    public abstract lookupPrincipalByGroupName(group: string): GroupPrincipal;

}
