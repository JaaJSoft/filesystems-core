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

    readAttributes(): PosixFileAttributes;

    setPermissions(perms: Set<PosixFilePermission>): void;

    setGroup(group: GroupPrincipal): void;

}
