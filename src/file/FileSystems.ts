import {FileSystem} from "./FileSystem";
import {LocalFileSystem} from "./fs/local/LocalFileSystem";
import {IllegalArgumentException} from "../exception/IllegalArgumentException";
import {ProviderNotFoundException} from "./ProviderNotFoundException";
import {installedProviders} from "./spi/FileSystemProviders";

export class FileSystems {
    public static getDefault(): FileSystem {
        return new LocalFileSystem();
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