import {UserPrincipal} from "./UserPrincipal";
import {GroupPrincipal} from "./GroupPrincipal";

export abstract class UserPrincipalLookupService { // TODO implements for local
    protected constructor() {
        // empty
    }

    /**
     * Lookup a user principal by name.
     *
     * @param   name
     *          the string representation of the user principal to lookup
     *
     * @return  a user principal
     *
     * @throws  UserPrincipalNotFoundException
     *          the principal does not exist
     * @throws  IOException
     *          if an I/O error occurs
     * @throws  SecurityException
     */
    public abstract lookupPrincipalByName(name: string): UserPrincipal;

    /**
     * Lookup a group principal by group name.
     *
     * <p> Where an implementation does not support any notion of group then
     * this method always throws {@link UserPrincipalNotFoundException}. Where
     * the namespace for user accounts and groups is the same, then this method
     * is identical to invoking {@link #lookupPrincipalByName
     * lookupPrincipalByName}.
     *
     * @param   group
     *          the string representation of the group to lookup
     *
     * @return  a group principal
     *
     * @throws  UserPrincipalNotFoundException
     *          the principal does not exist or is not a group
     * @throws  IOException
     *          if an I/O error occurs
     * @throws  SecurityException
     */
    public abstract lookupPrincipalByGroupName(group: string): GroupPrincipal;

}
