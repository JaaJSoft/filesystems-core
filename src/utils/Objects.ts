import {NullPointerException} from "../exception";

type Obj<T> = T | null | undefined

export class Objects {

    public static isNull<T>(o: Obj<T>): boolean {
        return o === null;
    }

    public static nonNull<T>(o: Obj<T>): boolean {
        return !this.isNull(o);
    }

    public static isUndefined<T>(o: Obj<T>): boolean {
        return o === undefined;
    }

    public static nonUndefined<T>(o: Obj<T>): boolean {
        return !this.isUndefined(o);
    }

    public static isNullUndefined<T>(o: Obj<T>): boolean {
        return this.isNull(o) || this.isUndefined(o);
    }

    public static nonNullUndefined<T>(o: Obj<T>): boolean {
        return !this.isUndefined(o);
    }

    public static requireNonNullUndefined<T>(o: Obj<T>): T {
        if (this.isNullUndefined(o)) {
            throw new NullPointerException();
        }
        return o as T;
    }

}
