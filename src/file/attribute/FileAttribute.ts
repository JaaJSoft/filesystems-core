export interface FileAttribute<T> {
    /**
     * Returns the attribute name.
     *
     * @return The attribute name
     */
    name(): string;

    /**
     * Returns the attribute value.
     *
     * @return The attribute value
     */
    value(): T;

}
