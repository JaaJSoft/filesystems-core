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

    /**
     * It splits a string into two parts, the first part is the type of the attribute, and the second part is the name of
     * the attribute
     * @param {string} attribute - The attribute to be parsed.
     * @returns The return value is an array of two strings. The first string is the type of the attribute and the second
     * string is the name of the attribute.
     */
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

    public async setAttribute(file: Path, attribute: string, value: unknown, options?: LinkOption[]): Promise<void> {
        const s: string[] = AbstractFileSystemProvider.split(attribute);
        if (s[0].length === 0)
            throw new IllegalArgumentException(attribute);
        const view: FileAttributeView = this.getFileAttributeView(file, s[0], options);
        if (view == null)
            throw new UnsupportedOperationException("View '" + s[0] + "' not available");
        await view.setAttributeByName(s[1], value);
    }

    public async readAttributes(file: Path, attributes: string, options?: LinkOption[]): Promise<Map<string, unknown>> {
        const s = AbstractFileSystemProvider.split(attributes);
        if (s[0].length == 0)
            throw new IllegalArgumentException(attributes);
        const view = this.getFileAttributeView(file, s[0], options);
        if (view == null)
            throw new UnsupportedOperationException("View '" + s[0] + "' not available");
        return view.readAttributesByName(s[1].split(","));
    }

}
