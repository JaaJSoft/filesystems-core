export enum PosixFilePermission {

    /**
     * Read permission, owner.
     */
    OWNER_READ = "OWNER_READ",

    /**
     * Write permission, owner.
     */
    OWNER_WRITE = "OWNER_WRITE",

    /**
     * Execute/search permission, owner.
     */
    OWNER_EXECUTE = "OWNER_EXECUTE",

    /**
     * Read permission, group.
     */
    GROUP_READ = "GROUP_READ",

    /**
     * Write permission, group.
     */
    GROUP_WRITE = "GROUP_WRITE",

    /**
     * Execute/search permission, group.
     */
    GROUP_EXECUTE = "GROUP_EXECUTE",

    /**
     * Read permission, others.
     */
    OTHERS_READ = "OTHERS_READ",

    /**
     * Write permission, others.
     */
    OTHERS_WRITE = "OTHERS_WRITE",

    /**
     * Execute/search permission, others.
     */
    OTHERS_EXECUTE = "OTHERS_EXECUTE"
}
