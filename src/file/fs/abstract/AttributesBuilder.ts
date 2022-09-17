import {IllegalArgumentException} from "../../../exception";

/* It builds a map of attributes from a list of requested attributes */
export class AttributesBuilder {
    private names = new Set<string>();
    private map: Map<string, unknown> = new Map<string, unknown>();
    private copyAll = false;

    private constructor(allowed: Set<string>, requested: string[]) {
        for (const name of requested) {
            if (name === "*") {
                this.copyAll = true;
            } else {
                if (!allowed.has(name))
                    throw new IllegalArgumentException("'" + name + "' not recognized");
                this.names.add(name);
            }
        }
    }

    /**
     * Creates builder to build up a map of the matching attributes
     */
    public static create(allowed: Set<string>, requested: string[]): AttributesBuilder {
        return new AttributesBuilder(allowed, requested);
    }

    public match(name: string): boolean {
        return this.copyAll || this.names.has(name);
    }

    public add(name: string, value: unknown): void {
        this.map.set(name, value);
    }

    public build(): Map<string, unknown> {
        return new Map<string, unknown>(this.map);
    }

}
