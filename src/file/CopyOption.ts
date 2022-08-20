import {StandardCopyOption} from "./StandardCopyOption";
import {LinkOption} from "./LinkOption";

/* A type that represents the options for copying a file. */
export type CopyOption = StandardCopyOption | LinkOption | string

