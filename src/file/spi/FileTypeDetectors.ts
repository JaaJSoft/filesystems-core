import {FileTypeDetector} from "./FileTypeDetector";
import {Path} from "../Path";

class DefaultFileTypeDetector extends FileTypeDetector {
    public constructor() {
        super();
    }

    public probeContentType(path: Path): string { // TODO
        throw new Error("Method not implemented.");
    }

}

export class FileTypeDetectors { // TODO
    public static readonly defaultFileTypeDetector: FileTypeDetector = FileTypeDetectors.createDefaultFileTypeDetector();

    public static readonly installedDetectors: FileTypeDetector[] = FileTypeDetectors.loadInstalledDetectors();

    static createDefaultFileTypeDetector(): FileTypeDetector {
        return new DefaultFileTypeDetector()
    }

    static loadInstalledDetectors(): FileTypeDetector[] { // TODO
        return []
    }
}

