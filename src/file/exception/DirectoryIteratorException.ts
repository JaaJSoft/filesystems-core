import {IOException} from "../../exception";

export class DirectoryIteratorException extends Error {
    private readonly ioCause: IOException;

    constructor(ioCause: IOException) {
        super();
        this.ioCause = ioCause;
    }

    public getCause(): IOException {
        return this.ioCause;
    }
}
