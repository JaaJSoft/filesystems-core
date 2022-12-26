import {FileTypeDetector} from "./FileTypeDetector";
import {Path} from "../Path";
import mime from "mime-types";

class DefaultFileTypeDetector extends FileTypeDetector {
    public constructor() {
        super();
    }

    public probeContentType(path: Path): string | null { // TODO
        const lookup: string | false = mime.lookup(path.toString());
        if (lookup === false) {
            return null;
        }
        return lookup;
    }

}

export class FileTypeDetectors { // TODO
    public static readonly defaultFileTypeDetector: FileTypeDetector = FileTypeDetectors.createDefaultFileTypeDetector();

    public static readonly installedDetectors: FileTypeDetector[] = FileTypeDetectors.loadInstalledDetectors();

    static createDefaultFileTypeDetector(): FileTypeDetector {
        return new DefaultFileTypeDetector();
    }

    static loadInstalledDetectors(): FileTypeDetector[] { // TODO
        return [];
    }
}

