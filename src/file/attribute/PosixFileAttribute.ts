import {FileAttribute} from "./FileAttribute";
import {PosixFilePermission} from "./PosixFilePermission";

export class PosixFileAttribute implements FileAttribute<Set<PosixFilePermission>> {
    private readonly perms: Set<PosixFilePermission>;

    constructor(perms: Set<PosixFilePermission>) {
        this.perms = perms;
    }

    public name(): string {
        return "posix:permissions";
    }

    public value(): Set<PosixFilePermission> {
        return this.perms;
    }

}
