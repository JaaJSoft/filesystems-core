import {BasicFileAttributes, BasicFileAttributeView, FileTime} from "../../attribute";
import {IllegalArgumentException} from "../../../exception";
import {AttributesBuilder} from "./AttributesBuilder";

export abstract class AbstractBasicFileAttributeView implements BasicFileAttributeView {

    private static readonly SIZE_NAME: string = "size";
    private static readonly CREATION_TIME_NAME: string = "creationTime";
    private static readonly LAST_ACCESS_TIME_NAME: string = "lastAccessTime";
    private static readonly LAST_MODIFIED_TIME_NAME: string = "lastModifiedTime";
    private static readonly FILE_KEY_NAME: string = "fileKey";
    private static readonly IS_DIRECTORY_NAME: string = "isDirectory";
    private static readonly IS_REGULAR_FILE_NAME: string = "isRegularFile";
    private static readonly IS_SYMBOLIC_LINK_NAME: string = "isSymbolicLink";
    private static readonly IS_OTHER_NAME: string = "isOther";

    // the names of the basic attributes
    static readonly basicAttributeNames = new Set<string>([
        AbstractBasicFileAttributeView.SIZE_NAME,
        AbstractBasicFileAttributeView.CREATION_TIME_NAME,
        AbstractBasicFileAttributeView.LAST_ACCESS_TIME_NAME,
        AbstractBasicFileAttributeView.LAST_MODIFIED_TIME_NAME,
        AbstractBasicFileAttributeView.FILE_KEY_NAME,
        AbstractBasicFileAttributeView.IS_DIRECTORY_NAME,
        AbstractBasicFileAttributeView.IS_REGULAR_FILE_NAME,
        AbstractBasicFileAttributeView.IS_SYMBOLIC_LINK_NAME,
        AbstractBasicFileAttributeView.IS_OTHER_NAME,
    ]);

    protected constructor() {
    }

    public name(): string {
        return "basic";
    }

    /**
     * It adds the requested attributes to the builder
     * @param {BasicFileAttributes} attrs - BasicFileAttributes
     * @param {AttributesBuilder} builder - AttributesBuilder
     */
    protected addRequestedBasicAttributes(attrs: BasicFileAttributes, builder: AttributesBuilder) {
        if (builder.match(AbstractBasicFileAttributeView.SIZE_NAME))
            builder.add(AbstractBasicFileAttributeView.SIZE_NAME, attrs.size());
        if (builder.match(AbstractBasicFileAttributeView.CREATION_TIME_NAME))
            builder.add(AbstractBasicFileAttributeView.CREATION_TIME_NAME, attrs.creationTime());
        if (builder.match(AbstractBasicFileAttributeView.LAST_ACCESS_TIME_NAME))
            builder.add(AbstractBasicFileAttributeView.LAST_ACCESS_TIME_NAME, attrs.lastAccessTime());
        if (builder.match(AbstractBasicFileAttributeView.LAST_MODIFIED_TIME_NAME))
            builder.add(AbstractBasicFileAttributeView.LAST_MODIFIED_TIME_NAME, attrs.lastModifiedTime());
        if (builder.match(AbstractBasicFileAttributeView.FILE_KEY_NAME))
            builder.add(AbstractBasicFileAttributeView.FILE_KEY_NAME, attrs.fileKey());
        if (builder.match(AbstractBasicFileAttributeView.IS_DIRECTORY_NAME))
            builder.add(AbstractBasicFileAttributeView.IS_DIRECTORY_NAME, attrs.isDirectory());
        if (builder.match(AbstractBasicFileAttributeView.IS_REGULAR_FILE_NAME))
            builder.add(AbstractBasicFileAttributeView.IS_REGULAR_FILE_NAME, attrs.isRegularFile());
        if (builder.match(AbstractBasicFileAttributeView.IS_SYMBOLIC_LINK_NAME))
            builder.add(AbstractBasicFileAttributeView.IS_SYMBOLIC_LINK_NAME, attrs.isSymbolicLink());
        if (builder.match(AbstractBasicFileAttributeView.IS_OTHER_NAME))
            builder.add(AbstractBasicFileAttributeView.IS_OTHER_NAME, attrs.isOther());
    }

    public readAttributesByName(attributes: string[]): Map<string, Object> {
        const builder = AttributesBuilder.create(AbstractBasicFileAttributeView.basicAttributeNames, attributes);
        this.addRequestedBasicAttributes(this.readAttributes(), builder);
        return builder.build();
    }

    public setAttributeByName(attribute: string, value: Object): void {
        if (attribute === (AbstractBasicFileAttributeView.LAST_MODIFIED_TIME_NAME)) {
            this.setTimes(value as FileTime, undefined, undefined);
            return;
        }
        if (attribute === (AbstractBasicFileAttributeView.LAST_ACCESS_TIME_NAME)) {
            this.setTimes(undefined, value as FileTime, undefined);
            return;
        }
        if (attribute === (AbstractBasicFileAttributeView.CREATION_TIME_NAME)) {
            this.setTimes(undefined, undefined, value as FileTime);
            return;
        }
        throw new IllegalArgumentException("'" + this.name() + ":" +
            attribute + "' not recognized");
    }

    /**
     * Reads the basic file attributes as a bulk operation.
     *
     * <p> It is implementation specific if all file attributes are read as an
     * atomic operation with respect to other file system operations.
     *
     * @return  the file attributes
     */
    public abstract readAttributes(): BasicFileAttributes;

    public abstract setTimes(lastModifiedTime?: FileTime, lastAccessTime?: FileTime, createTime?: FileTime): void;
}
