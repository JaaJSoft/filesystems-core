import {FileSystems} from "./FileSystems";
import {IllegalArgumentException} from "../exception/IllegalArgumentException";
import {installedProviders} from "./spi/FileSystemProviders";
import {FileSystemNotFoundException} from "./FileSystemNotFoundException";
import {Path} from "./Path";

export class Paths {

    public static of(first: string, more?: string[]): Path {
        return FileSystems.getDefault().getPath(first, more);
    }

    public static ofURL(url: URL): Path {
        const scheme = url.protocol.toLowerCase();
        if (scheme === null) {
            throw new IllegalArgumentException("Missing scheme");
        }
        if (scheme.toLowerCase() === "file") {
            return FileSystems.getDefault().provider().getPath(url);
        }
        for (const provider of installedProviders()) {
            if (provider.getScheme() === scheme) {
                return provider.getPath(url);
            }
        }
        throw new FileSystemNotFoundException(`Provider "${scheme}" not installed`)
    }

}