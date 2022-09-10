export interface Closeable {
    close(): void;
}

export interface AsyncCloseable {
    close(): Promise<void>;
}
