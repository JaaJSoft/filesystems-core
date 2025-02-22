export interface WatchEvent<T> {

    /**
     * Returns the event kind.
     *
     * @return  the event kind
     */
    kind(): WatchEventKind<T>;

    /**
     * Returns the event count. If the event count is greater than {@code 1}
     * then this is a repeated event.
     *
     * @return  the event count
     */
    count(): bigint;

    /**
     * Returns the context for the event.
     *
     * <p> In the case of {@link StandardWatchEventKinds#ENTRY_CREATE ENTRY_CREATE},
     * {@link StandardWatchEventKinds#ENTRY_DELETE ENTRY_DELETE}, and {@link
        * StandardWatchEventKinds#ENTRY_MODIFY ENTRY_MODIFY} events the context is
     * a {@code Path} that is the {@link Path#relativize relative} path between
     * the directory registered with the watch service, and the entry that is
     * created, deleted, or modified.
     *
     * @return  the event context; may be {@code null}
     */
    context(): T | null;
}

export interface WatchEventKind<T> {
    /**
     * An event kind, for the purposes of identification.
     *
     * @see StandardWatchEventKinds
     */
    name(): string;

    /**
     * Returns the type of the {@link WatchEvent#context context} value.
     *
     *
     * @return the type of the context value
     */
    type(): string;
}

/**
 * An event modifier that qualifies how a {@link Watchable} is registered
 * with a {@link WatchService}.
 *
 * <p> This release does not define any <em>standard</em> modifiers.
 *
 * @see Watchable#register
 */
export interface WatchEventModifier {
    /**
     * Returns the name of the modifier.
     *
     * @return the name of the modifier
     */
    name(): string;
}
