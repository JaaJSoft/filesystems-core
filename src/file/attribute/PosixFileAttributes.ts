import {BasicFileAttributes} from "./BasicFileAttributes";
import {PosixFilePermission} from "./PosixFilePermission";
import {UserPrincipal} from "./UserPrincipal";
import {GroupPrincipal} from "./GroupPrincipal";

export interface PosixFileAttributes extends BasicFileAttributes {

    /**
     * Returns the owner of the file.
     *
     * @return  the file owner
     *
     * @see PosixFileAttributeView#setOwner
     */
    owner(): UserPrincipal;

    /**
     * Returns the group owner of the file.
     *
     * @return  the file group owner
     *
     * @see PosixFileAttributeView#setGroup
     */
    group(): GroupPrincipal;

    /**
     * Returns the permissions of the file. The file permissions are returned
     * as a set of {@link PosixFilePermission} elements. The returned set is a
     * copy of the file permissions and is modifiable. This allows the result
     * to be modified and passed to the {@link PosixFileAttributeView#setPermissions
     * setPermissions} method to update the file's permissions.
     *
     * @return  the file permissions
     *
     * @see PosixFileAttributeView#setPermissions
     */
    permissions(): Set<PosixFilePermission>;
}
