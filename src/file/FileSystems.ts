import {FileSystem} from "./FileSystem";
import {IllegalArgumentException} from "../exception";
import {ProviderNotFoundException} from "./exception";
import {FileSystemProvider, FileSystemProviders} from "./spi";

export class FileSystems {

    private static readonly ROOT_URL: URL = new URL("file://");

    /**
     * Get the default file system.
     * @returns The default file system.
     */
    public static getDefault(): FileSystem {
        const defaultProvider: FileSystemProvider | undefined = FileSystemProviders.getProvider("file");
        if (defaultProvider) {
            return defaultProvider.getFileSystem(FileSystems.ROOT_URL);
        }
        throw new ProviderNotFoundException("no 'file://' provider installed");
    }

    /**
     * It returns a FileSystem object for the given URL
     * @param {URL} url - URL
     * @returns A FileSystem object
     */
    public static getFileSystem(url: URL): FileSystem | null {
        const scheme = url.protocol.toLowerCase();
        if (!scheme) {
            throw new IllegalArgumentException("Missing scheme");
        }
        const provider: FileSystemProvider | undefined = FileSystemProviders.getProvider(scheme);
        if (provider) {
            return provider.getFileSystem(url);
        }
        throw new ProviderNotFoundException(`Provider "${scheme}" not found`);
    }

    /**
     * "If the scheme of the given URI is supported by any of the installed providers, then return a new file system
     * created by that provider, otherwise throw an exception."
     *
     * The first thing the function does is to get the scheme of the given URI. The scheme is the part of the URI before
     * the first colon. For example, the scheme of the URI "http://www.example.com" is "http"
     * @param {URL} uri - The URI of the file system to open or create.
     * @param env - A map of environment variables to be used by the file system provider.
     * @returns A FileSystem object
     */
    public newFileSystem(uri: URL, env: Map<string, any>): FileSystem {
        const scheme: string = uri.protocol;

        // check installed providers
        FileSystemProviders.getProvider(scheme);
        const provider: FileSystemProvider | undefined = FileSystemProviders.getProvider(scheme);
        if (provider) {
            return provider.newFileSystemFromUrl(uri, env);
        }
        throw new ProviderNotFoundException("Provider \"" + scheme + "\" not found");
    }

    // TODO newFileSystem methods
}
