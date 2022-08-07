export enum StandardOpenOption {
    /**
     * Open for read access.
     */
    READ = "READ",

    /**
     * Open for write access.
     */
    WRITE = "WRITE",

    /**
     * If the file is opened for {@link #WRITE} access then bytes will be written
     * to the end of the file rather than the beginning.
     *
     * <p> If the file is opened for write access by other programs, then it
     * is file system specific if writing to the end of the file is atomic.
     */
    APPEND = "APPEND",

    /**
     * If the file already exists and it is opened for {@link #WRITE}
     * access, then its length is truncated to 0. This option is ignored
     * if the file is opened only for {@link #READ} access.
     */
    TRUNCATE_EXISTING = "TRUNCATE_EXISTING",

    /**
     * Create a new file if it does not exist.
     * This option is ignored if the {@link #CREATE_NEW} option is also set.
     * The check for the existence of the file and the creation of the file
     * if it does not exist is atomic with respect to other file system
     * operations.
     */
    CREATE = "CREATE",

    /**
     * Create a new file, failing if the file already exists.
     * The check for the existence of the file and the creation of the file
     * if it does not exist is atomic with respect to other file system
     * operations.
     */
    CREATE_NEW = "CREATE_NEW",

    /**
     * Delete on close. When this option is present then the implementation
     * makes a <em>best effort</em> attempt to delete the file when closed
     * by the appropriate {@code close} method.
     *
     * <p> For security reasons, this option may imply the {@link
        * LinkOption#NOFOLLOW_LINKS} option. In other words, if the option is present
     * when opening an existing file that is a symbolic link then it may fail
     * (by throwing {@link IOException}).
     */
    DELETE_ON_CLOSE = "DELETE_ON_CLOSE",

    /**
     * Sparse file. When used with the {@link #CREATE_NEW} option then this
     * option provides a <em>hint</em> that the new file will be sparse. The
     * option is ignored when the file system does not support the creation of
     * sparse files.
     */
    SPARSE = "SPARSE",

    /**
     * Requires that every update to the file's content or metadata be written
     * synchronously to the underlying storage device.
     *
     * @see <a href="package-summary.html#integrity">Synchronized I/O file integrity</a>
     */
    SYNC = "SYNC",

    /**
     * Requires that every update to the file's content be written
     * synchronously to the underlying storage device.
     *
     * @see <a href="package-summary.html#integrity">Synchronized I/O file integrity</a>
     */
    DSYNC = "DSYNC"
}
