/**
 * An object that provides a read-only or updatable <em>view</em> of non-opaque
 * values associated with an object in a filesystem. This interface is extended
 * or implemented by specific attribute views that define the attributes
 * supported by the view. A specific attribute view will typically define
 * type-safe methods to read or update the attributes that it supports.
 *
 */
export interface AttributeView {
    /**
     * Returns the name of the attribute view.
     *
     * @return the name of the attribute view
     */
    name(): AttributeViewName;
}

export type AttributeViewName = string
    | "basic" // BasicFileAttributeView
    | "posix" // PosixFileAttributeView
    | "owner" // FileOwnerAttributeView

