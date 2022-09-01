import {IllegalArgumentException} from "../../../exception";

export class AttributesBuilder {
    private names = new Set<string>();
    private map: Map<string, Object> = new Map<string, Object>();
    private copyAll: boolean = false;

    private constructor(allowed: Set<string>, requested: string[]) {
        for (let name of requested) {
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

    public add(name: string, value: Object): void {
        this.map.set(name, value);
    }

    public build(): Map<string, Object> {
        return new Map<string, Object>(this.map);
    }

}
