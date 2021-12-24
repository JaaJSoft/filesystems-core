export abstract class UserPrincipalLookupService {
    protected constructor() {
    }

    public abstract lookupPrincipalByName(name: string); // TODO
    public abstract lookupPrincipalByGroupName(group: string);

}