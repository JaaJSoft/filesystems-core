export class FileSystemAlreadyExistsException extends Error {
    private readonly input: string;
    private readonly index: number;

    constructor(input: string, reason: string, index = -1) {
        super(reason);
        this.input = input;
        this.index = index;
    }

    public getInput(): string {
        return this.input;
    }

    public getIndex(): number {
        return this.index;
    }
}
