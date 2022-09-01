import {FileSystemProvider} from "../../spi";
import {LinkOption} from "../../LinkOption";
import {Path} from "../../Path";
import {IllegalArgumentException, UnsupportedOperationException} from "../../../exception";
import {FileAttributeView} from "../../attribute";

/**
 * Base implementation class of FileSystemProvider
 */
export abstract class AbstractFileSystemProvider extends FileSystemProvider {

    protected constructor() {
        super();
    }

    private static split(attribute: string): string[] {
        const s: string[] = [];
        let pos = attribute.indexOf(":");
        if (pos === -1) {
            s[0] = "basic";
            s[1] = attribute;
        } else {
            s[0] = attribute.substring(0, pos++);
            s[1] = (pos == attribute.length) ? "" : attribute.substring(pos);
        }
        return s;
    }

    public setAttribute(file: Path, attribute: string, value: Object, options?: LinkOption[]): void {
        const s: string[] = AbstractFileSystemProvider.split(attribute);
        if (s[0].length === 0)
            throw new IllegalArgumentException(attribute);
        const view: FileAttributeView = this.getFileAttributeView(file, s[0], options);
        if (view == null)
            throw new UnsupportedOperationException("View '" + s[0] + "' not available");
        view.setAttributeByName(s[1], value);
    }

    public readAttributes(file: Path, attributes: string, options?: LinkOption[]): Map<string, any> {
        const s = AbstractFileSystemProvider.split(attributes);
        if (s[0].length == 0)
            throw new IllegalArgumentException(attributes);
        const view = this.getFileAttributeView(file, s[0], options);
        if (view == null)
            throw new UnsupportedOperationException("View '" + s[0] + "' not available");
        return view.readAttributesByName(s[1].split(","));
    }

    abstract implDelete(file: Path, failIfNotExists: boolean): boolean;

    public delete(path: Path): boolean {
        return this.implDelete(path, true);
    }

    /**
     * If the file exists, delete it and return true. Otherwise, return false
     * @param {Path} path - The path to the file or directory to delete.
     * @returns A boolean value.
     */
    public deleteIfExists(path: Path): boolean {
        return this.implDelete(path, false);
    }
}
