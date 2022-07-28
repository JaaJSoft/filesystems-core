import {IOException} from "../../exception";

export class FileSystemException extends IOException {
    private readonly file: string | undefined;
    private readonly other: string | undefined;

    constructor(file?: string, other?: string, reason?: string) {
        super(reason);
        this.file = file;
        this.other = other;
    }

    getFile(): string | undefined {
        return this.file;
    }

    getOther(): string | undefined {
        return this.other;
    }

    getReason(): string {
        return super.message;
    }
}
