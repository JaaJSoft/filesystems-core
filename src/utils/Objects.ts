import {NullPointerException} from "../exception";

export class Objects {

    public static isNull(o: any): boolean {
        return o === null;
    }

    public static nonNull(o: any): boolean {
        return !this.isNull(o);
    }

    public static isUndefined(o: any): boolean {
        return o === undefined;
    }

    public static nonUndefined(o: any): boolean {
        return !this.isUndefined(o);
    }

    public static isNullUndefined(o: any): boolean {
        return this.isNull(o) || this.isUndefined(o);
    }

    public static nonNullUndefined(o: any): boolean {
        return !this.isUndefined(o);
    }

    public static requireNonNullUndefined(o: any): any {
        if (this.isNullUndefined(o)) {
            throw new NullPointerException();
        }
        return o;
    }

}
