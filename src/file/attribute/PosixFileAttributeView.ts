import {BasicFileAttributeView} from "./BasicFileAttributeView";
import {FileOwnerAttributeView} from "./FileOwnerAttributeView";
import {PosixFileAttributes} from "./PosixFileAttributes";
import {PosixFilePermission} from "./PosixFilePermission";
import {GroupPrincipal} from "./GroupPrincipal";

export interface PosixFileAttributeView extends BasicFileAttributeView, FileOwnerAttributeView {
    /**
     * Returns the name of the attribute view. Attribute views of this type
     * have the name {@code "posix"}.
     */
    name(): string;

    readAttributes(): Promise<PosixFileAttributes>;

    /* Setting the permissions of the file. */
    setPermissions(perms: Set<PosixFilePermission>): Promise<void>;

    /* Setting the group of the file. */
    setGroup(group: GroupPrincipal): Promise<void>;

}
