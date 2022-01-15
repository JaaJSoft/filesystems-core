import {FileSystemException} from "./FileSystemException";

export class AccessDeniedException extends FileSystemException {
    constructor(file: string, other?: string, reason?: string) {
        super(file, other, reason);
    }
}
