import {FileSystem} from "./FileSystem";
import {IllegalArgumentException, UnsupportedOperationException} from "../exception";
import {ProviderNotFoundException} from "./exception";
import {FileSystemProviders} from "./spi";
import {LocalFileSystemProvider} from "./fs/local";

export class FileSystems {
    private static readonly defaultFileSystemProvider: LocalFileSystemProvider = new LocalFileSystemProvider();

    /**
     * Get the default file system.
     * @returns The default file system.
     */
    public static getDefault(): FileSystem {
        return FileSystems.defaultFileSystemProvider.getTheFileSystem();
    }

    /**
     * It returns a FileSystem object for the given URL
     * @param {URL} url - URL
     * @returns A FileSystem object
     */
    public static getFileSystem(url: URL): FileSystem | null {
        const scheme = url.protocol.toLowerCase();
        if (scheme === null) {
            throw new IllegalArgumentException("Missing scheme");
        }
        for (const provider of FileSystemProviders.getInstalledProviders()) {
            if (provider.getScheme() === scheme) {
                return provider.getFileSystem(url);
            }
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
        const scheme: string = uri.protocol.toLowerCase();

        // check installed providers
        for (const provider of FileSystemProviders.getInstalledProviders()) {
            if (scheme === provider.getScheme()) {
                try {
                    return provider.newFileSystemFromUrl(uri, env);
                } catch (exception) {
                    if (exception instanceof UnsupportedOperationException) {
                        // ignored
                    } else {
                        throw exception;
                    }
                }
            }
        }
        throw new ProviderNotFoundException("Provider \"" + scheme + "\" not found");
    }

    // TODO newFileSystem methods
}
