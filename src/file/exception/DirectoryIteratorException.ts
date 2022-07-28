import {IOException} from "../../exception";

export class DirectoryIteratorException extends Error {
    private readonly cause: IOException;

    constructor(cause: IOException) {
        super();
        this.cause = cause;
    }

    public getCause(): IOException {
        return this.cause;
    }
}
