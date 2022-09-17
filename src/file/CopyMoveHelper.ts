import {CopyOption} from "./CopyOption";
import {LinkOption} from "./LinkOption";
import {IOException, NullPointerException, UnsupportedOperationException} from "../exception";
import {StandardCopyOption} from "./StandardCopyOption";
import {AtomicMoveNotSupportedException} from "./exception/AtomicMoveNotSupportedException";
import {Path} from "./Path";
import {Files} from "./Files";
import {FileAlreadyExistsException} from "./exception";
import {BasicFileAttributeView} from "./attribute";

class CopyOptions {
    replaceExisting = false;
    copyAttributes = false;
    followLinks = true;


    private constructor() {
        // empty
    }

    public static parse(options?: CopyOption[]): CopyOptions {
        const result = new CopyOptions();
        if (options) {
            for (const option of options) {
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
        }
        return result;
    }
}

function convertMoveToCopyOptions(options?: CopyOption[]): CopyOption[] {
    const newOptions: CopyOption[] = [];
    if (options) {
        for (const option of options) {
            if (option === StandardCopyOption.ATOMIC_MOVE) {
                throw new AtomicMoveNotSupportedException(undefined, undefined, "Atomic move between providers is not supported");
            }
            newOptions.push(option);
        }
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

    const attrs = await Files.readAttributesByName(source, "basic", linkOptions);
    if (attrs.isSymbolicLink()) {
        throw new IOException("Copying of symbolic links not supported");
    }
    if (opts.replaceExisting) {
        await Files.deleteIfExists(target);
    } else if (await Files.exists(target)) {
        throw new FileAlreadyExistsException(target.toString());
    }

    if (attrs.isDirectory()) {
        await Files.createDirectory(target);
    } else {
        let inputStream: ReadableStream | null = null;
        try {
            inputStream = Files.newInputStream(source);
            await Files.copyFromStream(inputStream, target);
        } finally {
            if (inputStream) {
                await inputStream.cancel();
            }
        }
    }

    // copy basic attributes to target
    if (opts.copyAttributes) {
        const view = await Files.getFileAttributeView(target, "basic") as BasicFileAttributeView;
        try {
            await view.setTimes(
                attrs.lastModifiedTime(),
                attrs.lastAccessTime(),
                attrs.creationTime(),
            );
        } catch (x) {
            // rollback
            await Files.delete(target);
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
    await Files.delete(source);
}
