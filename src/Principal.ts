export interface Principal {
    equals(other: Principal): boolean;

    toString(): string;

    getName(): string;

}
