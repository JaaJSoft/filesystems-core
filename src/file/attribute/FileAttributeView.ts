import {AttributeView} from "./AttributeView";

export interface FileAttributeView extends AttributeView {
    /**
     * Sets/updates the value of an attribute.
     */
    setAttributeByName(attribute: string, value: unknown): Promise<void>;

    /**
     * Reads a set of file attributes as a bulk operation.
     */
    readAttributesByName(attributes: string[]): Promise<Map<string, unknown>>;
}
