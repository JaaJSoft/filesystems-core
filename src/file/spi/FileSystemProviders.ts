import {FileSystemProvider} from "./FileSystemProvider";

/* It's a class that manages a list of file system providers */
export class FileSystemProviders {

    private static readonly installedProviders: Map<string, FileSystemProvider> = FileSystemProviders.loadProviders();

    private static loadProviders(): Map<string, FileSystemProvider> {
        return new Map();
    }

    /**
     * This function adds a new file system provider to the list of installed providers
     * @param {FileSystemProvider} provider - FileSystemProvider
     */
    public static addProvider(provider: FileSystemProvider): void {
        this.installedProviders.set(provider.getScheme().toUpperCase(), provider);
    }


    /**
     * It returns a map of all the installed providers
     * @returns A map of the installed providers.
     */
    public static getInstalledProvidersMap(): Map<string, FileSystemProvider> {
        return this.installedProviders;
    }

    /**
     * It returns an array of all the installed providers
     * @returns The installed providers.
     */
    public static getInstalledProviders(): Iterable<FileSystemProvider> {
        return this.installedProviders.values();
    }

    public static getProvider(scheme: string): FileSystemProvider | undefined {
        return this.installedProviders.get(scheme.toUpperCase());
    }

    public static cleanScheme(scheme: string): string {
        return scheme.replace(":", "").toUpperCase();
    }
}
