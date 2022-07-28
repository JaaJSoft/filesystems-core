import {FileSystemProvider} from "./FileSystemProvider";

/* It's a class that manages a list of file system providers */
export class FileSystemProviders {
    private static readonly installedProviders: FileSystemProvider[] = FileSystemProviders.loadProviders()

    private static loadProviders() {
        return [];
    }

    public static addProvider(provider: FileSystemProvider): void {
        this.installedProviders.push(provider);
    }

    /**
     * It returns an array of all the installed providers
     * @returns The installed providers.
     */
    public static getInstalledProviders(): FileSystemProvider[] {
        return this.installedProviders;
    }
}
