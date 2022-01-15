export class FileSystemException extends Error {
    private readonly file: string;
    private readonly other: string;

    constructor(file: string, other?: string, reason?: string) {
        super(reason);
        this.file = file;
        this.other = other;
    }

    getFile(): string {
        return this.file;
    }

    getOther(): string {
        return this.other;
    }

    getReason(): string {
        return super.message;
    }
}
