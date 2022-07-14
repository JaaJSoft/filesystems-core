import {FileSystem} from "./FileSystem";
import {IllegalArgumentException} from "../exception/IllegalArgumentException";
import {ProviderNotFoundException} from "./ProviderNotFoundException";
import {installedProviders} from "./spi/FileSystemProviders";
import {LocalFileSystemProvider} from "./fs/local/LocalFileSystemProvider";
import {UnsupportedOperationException} from "../exception/UnsupportedOperationException";

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
    public static getFileSystem(url: URL): FileSystem {
        const scheme = url.protocol.toLowerCase();
        if (scheme === null) {
            throw new IllegalArgumentException("Missing scheme");
        }
        for (const provider of installedProviders()) {
            if (provider.getScheme() === scheme) {
                return provider.getFileSystem(url);
            }
        }
        throw new ProviderNotFoundException(`Provider "${scheme}" not found`)
    }

    public newFileSystem(uri: URL, env: Map<string, any>): FileSystem {
        const scheme: string = uri.protocol.toLowerCase();

        // check installed providers
        for (const provider of installedProviders()) {
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
