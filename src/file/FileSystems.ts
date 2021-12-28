import {FileSystem} from "./FileSystem";
import {LocalFileSystem} from "./fs/local/LocalFileSystem";
import {FileSystemProvider} from "./spi/FileSystemProvider";

export class FileSystems {
    public static getDefault(): FileSystem {
        return new LocalFileSystem();
    }

    public static getFileSystem(url: URL): FileSystem {
        const scheme = url.protocol.toLowerCase();
        if (scheme === null) {
            throw new Error("Missing scheme");
        }
        for (const provider of FileSystemProvider.installedProviders()) {
            if (provider.getScheme() === scheme) {
                return provider.getFileSystem(url);
            }
        }
        throw new Error(`Provider "${scheme}" not found`)    }

}