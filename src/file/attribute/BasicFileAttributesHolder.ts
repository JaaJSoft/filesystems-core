import {BasicFileAttributes} from "./BasicFileAttributes";

/**
 * Implemented by objects that may hold or cache the attributes of a file.
 */
export interface BasicFileAttributesHolder {
    /**
     * Returns cached attributes (may be null). If file is a symbolic link then
     * the attributes are the link attributes and not the final target of the
     * file.
     */
    get(): BasicFileAttributes | null;

    /**
     * Invalidates cached attributes
     */
    invalidate(): void;
}
