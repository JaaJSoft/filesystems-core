import {FileSystemException} from "./FileSystemException";

export class FileSystemLoopException extends FileSystemException {
    
    constructor(file: string) {
        super(file);
    }
}
