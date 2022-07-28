import {BasicFileAttributeView} from "./BasicFileAttributeView";
import {UserPrincipal} from "./UserPrincipal";

export interface FileOwnerAttributeView extends BasicFileAttributeView {
    /**
     * Returns the name of the attribute view. Attribute views of this type
     * have the name {@code "owner"}.
     */
    name(): string;

    getOwner(): UserPrincipal;

    setOwner(owner: UserPrincipal): void;
}
