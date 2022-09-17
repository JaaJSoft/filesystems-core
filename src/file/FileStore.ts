import {UnsupportedOperationException} from "../exception";
import {FileStoreAttributeView} from "./attribute/FileStoreAttributeView";

export abstract class FileStore {

    protected constructor() {
        //
    }

    /**
     * Returns the name of this file store. The format of the name is highly
     * implementation specific. It will typically be the name of the storage
     * pool or volume.
     *
     * <p> The string returned by this method may differ from the string
     * returned by the {@link Object#toString() toString} method.
     *
     * @return  the name of this file store
     */
    public abstract name(): string;

    /**
     * Returns the <em>type</em> of this file store. The format of the string
     * returned by this method is highly implementation specific. It may
     * indicate, for example, the format used or if the file store is local
     * or remote.
     *
     * @return  a string representing the type of this file store
     */
    public abstract type(): string;

    /**
     * Tells whether this file store is read-only. A file store is read-only if
     * it does not support write operations or other changes to files. Any
     * attempt to create a file, open an existing file for writing etc. causes
     * an {@code IOException} to be thrown.
     *
     * @return  {@code true} if, and only if, this file store is read-only
     */
    public abstract isReadOnly(): boolean;

    /**
     * Returns the size, in bytes, of the file store.
     *
     * @return  the size of the file store, in bytes
     *
     * @throws  IOException
     *          if an I/O error occurs
     */
    public abstract getTotalSpace(): bigint;

    /**
     * Returns the number of bytes available on the file store.
     *
     * <p> The returned number of available bytes is a hint, but not a
     * guarantee, that it is possible to use most or any of these bytes.  The
     * number of usable bytes is most likely to be accurate immediately
     * after the space attributes are obtained. It is likely to be made inaccurate
     * by any external I/O operations including those made on the system.
     *
     * @return  the number of bytes available
     *
     * @throws  IOException
     *          if an I/O error occurs
     */
    public abstract getUsableSpace(): bigint;

    /**
     * Returns the number of bytes per block in this file store.
     *
     * <p> File storage is typically organized into discrete sequences of bytes
     * called <i>blocks</i>. A block is the smallest storage unit of a file store.
     * Every read and write operation is performed on a multiple of blocks.
     *
     * @implSpec The implementation in this class throws an
     *         {@code UnsupportedOperationException}.
     *
     * @return  a positive value representing the block size of this file store,
     *          in bytes
     *
     * @throws  IOException
     *          if an I/O error occurs
     *
     * @throws  UnsupportedOperationException
     *          if the operation is not supported
     *
     */
    public getBlockSize(): bigint {
        throw new UnsupportedOperationException();
    }

    /**
     * Returns the number of unallocated bytes in the file store.
     *
     * <p> The returned number of unallocated bytes is a hint, but not a
     * guarantee, that it is possible to use most or any of these bytes.  The
     * number of unallocated bytes is most likely to be accurate immediately
     * after the space attributes are obtained. It is likely to be
     * made inaccurate by any external I/O operations including those made on
     * the system.
     *
     * @return  the number of unallocated bytes
     *
     * @throws  IOException
     *          if an I/O error occurs
     */
    public abstract getUnallocatedSpace(): bigint;

    /**
     * Tells whether or not this file store supports the file attributes
     * identified by the given file attribute view.
     *
     * <p> Invoking this method to test if the file store supports {@link
        * BasicFileAttributeView}, identified by the name "{@code basic}" will
     * always return {@code true}. In the case of the default provider, this
     * method cannot guarantee to give the correct result when the file store is
     * not a local storage device. The reasons for this are implementation
     * specific and therefore unspecified.
     *
     * @param   name
     *          the {@link FileAttributeView#name name} of file attribute view
     *
     * @return  {@code true} if, and only if, the file attribute view is
     *          supported
     */
    public abstract supportsFileAttributeView(name: string): boolean;

    /**
     * Returns a {@code FileStoreAttributeView} of the given name.
     *
     * <p> This method is intended to be used where the file store attribute
     * view defines type-safe methods to read or update the file store attributes.
     * The {@code type} parameter is the type of the attribute view required and
     * the method returns an instance of that type if supported.
     *
     * @param   name the name of the view
     *
     * @return  a file store attribute view of the specified type or
     *          {@code null} if the attribute view is not available
     */
    public abstract getFileStoreAttributeView(name: string): FileStoreAttributeView;

    /**
     * Reads the value of a file store attribute.
     *
     * <p> The {@code attribute} parameter identifies the attribute to be read
     * and takes the form:
     * <blockquote>
     * <i>view-name</i><b>:</b><i>attribute-name</i>
     * </blockquote>
     * where the character {@code ':'} stands for itself.
     *
     * <p> <i>view-name</i> is the {@link FileStoreAttributeView#name name} of
     * a {@link FileStore AttributeView} that identifies a set of file attributes.
     * <i>attribute-name</i> is the name of the attribute.
     *
     * <p> <b>Usage Example:</b>
     * Suppose we want to know if ZFS compression is enabled (assuming the "zfs"
     * view is supported):
     * <pre>
     *    const compression = fs.getAttribute("zfs:compression") as boolean;
     * </pre>
     *
     * @param   attribute
     *          the attribute to read

     * @return  the attribute value; {@code null} may be valid for some
     *          attributes
     *
     * @throws  UnsupportedOperationException
     *          if the attribute view is not available or it does not support
     *          reading the attribute
     * @throws  IOException
     *          if an I/O error occurs
     */
    public abstract getAttribute(attribute: string): unknown;

}
