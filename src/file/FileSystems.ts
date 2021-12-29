import {FileSystem} from "./FileSystem";
import {IllegalArgumentException} from "../exception/IllegalArgumentException";
import {ProviderNotFoundException} from "./ProviderNotFoundException";
import {installedProviders} from "./spi/FileSystemProviders";
import {LocalFileSystemProvider} from "./fs/local/LocalFileSystemProvider";

export class FileSystems {
    public static getDefault(): FileSystem {
        return new LocalFileSystemProvider().getTheFileSystem();
    }

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
        throw new ProviderNotFoundException(`Provider "${scheme}" not found`)    }

}