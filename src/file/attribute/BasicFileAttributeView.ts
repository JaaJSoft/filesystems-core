import {FileAttributeView} from "./FileAttributeView";
import {BasicFileAttributes} from "./BasicFileAttributes";
import {FileTime} from "./FileTime";

export interface BasicFileAttributeView extends FileAttributeView {

    /**
     * Returns the name of the attribute view. Attribute views of this type
     * have the name {@code "basic"}.
     */
    name(): string;

    /**
     * Reads the basic file attributes as a bulk operation.
     *
     * <p> It is implementation specific if all file attributes are read as an
     * atomic operation with respect to other file system operations.
     *
     * @return  the file attributes
     */
    readAttributes(): BasicFileAttributes;

    setTimes(lastModifiedTime?: FileTime, lasAccessTime?: FileTime, createTime?: FileTime): void;

}
