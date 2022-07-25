import {FileSystemProviders} from "../../spi";
import {LocalFileSystemProvider} from "./LocalFileSystemProvider";

export * from "./LocalFileSystem"
export * from "./LocalFileSystemProvider"
export * from "./LocalPath"
export * from "./LocalPathType"


/* Registering the LocalFileSystemProvider with the FileSystemProviders class. */
FileSystemProviders.addProvider(new LocalFileSystemProvider());
