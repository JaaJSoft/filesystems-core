import {CopyOption} from "./CopyOption";
import {LinkOption} from "./LinkOption";
import {IOException, NullPointerException, UnsupportedOperationException} from "../exception";
import {StandardCopyOption} from "./StandardCopyOption";
import {AtomicMoveNotSupportedException} from "./AtomicMoveNotSupportedException";
import {Path} from "./Path";
import {Files} from "./Files";
import {FileAlreadyExistsException} from "./FileAlreadyExistsException";
import {BasicFileAttributeView} from "./attribute";

class CopyOptions {
    replaceExisting: boolean = false;
    copyAttributes: boolean = false;
    followLinks: boolean = true;


    private constructor() {
    }

    public static parse(options?: CopyOption[]): CopyOptions {
        const result = new CopyOptions();
        for (let option of options) {
            if (option === StandardCopyOption.REPLACE_EXISTING) {
                result.replaceExisting = true;
                continue;
            }
            if (option == LinkOption.NOFOLLOW_LINKS) {
                result.followLinks = false;
                continue;
            }
            if (option == StandardCopyOption.COPY_ATTRIBUTES) {
                result.copyAttributes = true;
                continue;
            }
            if (option == null)
                throw new NullPointerException();
            throw new UnsupportedOperationException("'" + option +
                "' is not a recognized copy option");
        }
        return result;
    }
}

function convertMoveToCopyOptions(options?: CopyOption[]): CopyOption[] {
    const newOptions: CopyOption[] = []
    for (let option of options) {
        if (option === StandardCopyOption.ATOMIC_MOVE) {
            throw new AtomicMoveNotSupportedException(null, null, "Atomic move between providers is not supported")
        }
        newOptions.push(option);
    }
    newOptions.push(LinkOption.NOFOLLOW_LINKS);
    newOptions.push(StandardCopyOption.COPY_ATTRIBUTES);
    return newOptions;
}

/**
 * Simple copy for use when source and target are associated with different
 * providers
 */
export async function copyToForeignTarget(source: Path, target: Path, options?: CopyOption[]): Promise<void> {
    const opts: CopyOptions = CopyOptions.parse(options);
    const linkOptions: LinkOption[] = opts.followLinks ? [] : [LinkOption.NOFOLLOW_LINKS];

    const attrs = Files.readAttributesWithType(source, "BasicFileAttributes", linkOptions);
    if (attrs.isSymbolicLink()) {
        throw new IOException("Copying of symbolic links not supported");
    }
    if (opts.replaceExisting) {
        Files.deleteIfExists(target);
    } else if (Files.exists(target)) {
        throw new FileAlreadyExistsException(target.toString());
    }

    if (attrs.isDirectory()) {
        Files.createDirectory(target);
    } else {
        let inputStream: ReadableStream;
        try {
            inputStream = this.newInputStream(source);
            await Files.copyFromStream(inputStream, target);
        } finally {
            await inputStream.cancel();
        }
    }

    // copy basic attributes to target
    if (opts.copyAttributes) {
        const view = Files.getFileAttributeView(target, "BasicFileAttributeView") as BasicFileAttributeView;
        try {
            view.setTimes(
                attrs.lastModifiedTime(),
                attrs.lastAccessTime(),
                attrs.creationTime()
            );
        } catch (x) {
            // rollback
            Files.delete(target);
            throw x;
        }
    }

}

/**
 * Simple move implements as copy+delete for use when source and target are
 * associated with different providers
 */
export async function moveToForeignTarget(source: Path, target: Path, options?: CopyOption[]) {
    await copyToForeignTarget(source, target, convertMoveToCopyOptions(options));
    Files.delete(source);
}
