import {FileSystemException} from "./FileSystemException";

/* AccessDeniedException is a FileSystemException that is thrown when a file cannot be accessed. */
export class AccessDeniedException extends FileSystemException {
    constructor(file: string, other?: string, reason?: string) {
        super(file, other, reason);
    }
}
