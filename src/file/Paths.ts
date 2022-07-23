import {FileSystems} from "./FileSystems";
import {IllegalArgumentException} from "../exception";
import {installedProviders} from "./spi";
import {FileSystemNotFoundException} from "./exception/FileSystemNotFoundException";
import {Path} from "./Path";

/* This class provides static methods to create Path objects.*/
export class Paths {

    /**
     * "This function returns a Path object that represents the path specified by the first and more parameters."
     *
     * The first parameter is a string that represents the first part of the path. The second parameter is an optional
     * array of strings that represent the remaining parts of the path
     * @param {string} first - The first path component.
     * @param {string[]} [more] - string[]
     * @returns A Path object
     */
    public static of(first: string, more?: string[]): Path | null {
        return FileSystems.getDefault().getPath(first, more);
    }

    /**
     * If the scheme is "file", then return the default file system's path. Otherwise, return the path of the first
     * installed provider whose scheme matches the scheme of the URL
     * @param {URL} url - URL
     * @returns A Path object
     */
    public static ofURL(url: URL): Path | null {
        const scheme = url.protocol.toLowerCase().replace(":", "");
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
