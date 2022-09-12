import {UserPrincipal} from "./UserPrincipal";
import {FileAttributeView} from "./FileAttributeView";

export interface FileOwnerAttributeView extends FileAttributeView {
    /**
     * Returns the name of the attribute view. Attribute views of this type
     * have the name {@code "owner"}.
     */
    name(): string;

    getOwner(): Promise<UserPrincipal>;

    /* Setting the owner of the file. */
    setOwner(owner: UserPrincipal): Promise<void>;
}
