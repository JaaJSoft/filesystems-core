export abstract class UserPrincipalLookupService { // TODO Maybe
    protected constructor() {
    }

    public abstract lookupPrincipalByName(name: string); // TODO
    public abstract lookupPrincipalByGroupName(group: string);

}