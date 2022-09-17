import {AbstractBasicFileAttributeView} from "./AbstractBasicFileAttributeView";
import {
    GroupPrincipal,
    PosixFileAttributes,
    PosixFileAttributeView,
    PosixFilePermission,
    UserPrincipal,
} from "../../attribute";
import {AttributesBuilder} from "./AttributesBuilder";

export abstract class AbstractPosixFileAttributeView extends AbstractBasicFileAttributeView implements PosixFileAttributeView {

    protected static readonly PERMISSIONS_NAME: string = "permissions";
    protected static readonly OWNER_NAME: string = "owner";
    protected static readonly GROUP_NAME: string = "group";
    protected static readonly posixAttributeNames: Set<string> = new Set<string>([
        AbstractPosixFileAttributeView.PERMISSIONS_NAME,
        AbstractPosixFileAttributeView.OWNER_NAME,
        AbstractPosixFileAttributeView.GROUP_NAME,
        ...this.basicAttributeNames,
    ]);

    public abstract getOwner(): Promise<UserPrincipal>;

    public abstract setGroup(group: GroupPrincipal): Promise<void>;

    public abstract setOwner(owner: UserPrincipal): Promise<void>;

    public abstract setPermissions(perms: Set<PosixFilePermission>): Promise<void>;

    public abstract readAttributes(): Promise<PosixFileAttributes>;

    protected addRequestedPosixAttributes(attrs: PosixFileAttributes, builder: AttributesBuilder) {
        this.addRequestedBasicAttributes(attrs, builder);
        if (builder.match(AbstractPosixFileAttributeView.PERMISSIONS_NAME))
            builder.add(AbstractPosixFileAttributeView.PERMISSIONS_NAME, attrs.permissions());
        if (builder.match(AbstractPosixFileAttributeView.OWNER_NAME))
            builder.add(AbstractPosixFileAttributeView.OWNER_NAME, attrs.owner());
        if (builder.match(AbstractPosixFileAttributeView.GROUP_NAME))
            builder.add(AbstractPosixFileAttributeView.GROUP_NAME, attrs.group());
    }

    public async readAttributesByName(attributes: string[]): Promise<Map<string, unknown>> {
        const builder = AttributesBuilder.create(AbstractPosixFileAttributeView.posixAttributeNames, attributes);
        const posixFileAttributes: PosixFileAttributes = await this.readAttributes();
        this.addRequestedPosixAttributes(posixFileAttributes, builder);
        return builder.build();
    }


    public async setAttributeByName(attribute: string, value: unknown): Promise<void> {
        if (attribute === AbstractPosixFileAttributeView.PERMISSIONS_NAME) {
            await this.setPermissions(value as Set<PosixFilePermission>);
            return;
        }
        if (attribute === AbstractPosixFileAttributeView.OWNER_NAME) {
            await this.setOwner(value as UserPrincipal);
            return;
        }
        if (attribute === AbstractPosixFileAttributeView.GROUP_NAME) {
            await this.setGroup(value as GroupPrincipal);
            return;
        }
        await super.setAttributeByName(attribute, value);
    }
}
