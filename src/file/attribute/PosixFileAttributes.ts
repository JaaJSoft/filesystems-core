import {BasicFileAttributes} from "./BasicFileAttributes";
import {PosixFilePermission} from "./PosixFilePermission";

export interface PosixFileAttributes extends BasicFileAttributes {
    // TODO

    permissions(): Set<PosixFilePermission>
}
