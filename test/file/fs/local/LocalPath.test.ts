import {Files, Path, Paths} from "../../../../src/file";
import os from "os";
import {Objects} from "../../../../src/utils";
import {TextDecoderStream} from "node:stream/web";

const rootPath: Path = Paths.of("/");
const currentPath: Path = Paths.of(".");

test("LocalPathRoot", () => {
    const myRoot = rootPath.getRoot();
    expect(myRoot?.equals(rootPath)).toBeTruthy();
});

test("LocalPathRootWithURL", () => {
    const root = Paths.ofURL(new URL("file:///C:/"));
    expect(root?.getRoot()?.equals(root)).toBeTruthy();
});

test("LocalPathNotRootWithURL", () => {
    const path = Paths.ofURL(new URL("file://D:/test.txt"));
    expect(path.getRoot()?.equals(rootPath)).toBeFalsy();
});

test("LocalPathExists", () => {
    const nullPath = Paths.ofURL(new URL("file:///T:/"));
    expect(Files.exists(nullPath)).toBeFalsy();
});

test("LocalPathCurrentToAbsolutePath", () => {
    Objects.requireNonNullUndefined(currentPath);
    const absolutePath = currentPath?.toAbsolutePath();
    Objects.requireNonNullUndefined(absolutePath);
    expect(absolutePath?.isAbsolute()).toBeTruthy();
    expect(absolutePath?.getRoot()?.toURL().toString() === absolutePath?.toURL().toString()).toBeFalsy();
});

test("LocalPathCurrentGetRoot", () => {
    expect(currentPath?.getRoot()).toBeNull();
    if (os.platform() == "win32") {
        expect(currentPath?.toAbsolutePath().getRoot()).toBeDefined();
    } else {
        expect(currentPath?.toAbsolutePath()?.getRoot()?.equals(rootPath?.toAbsolutePath())).toBeTruthy();
    }
});

test("LocalPathNewImputStream", async () => {
    const path = Paths.of("D:\\JAAJ.txt");
    if (os.platform() == "win32") {
        const readableStream: ReadableStream<Uint8Array> = Files.newInputStream(path);
        const textDecoderStream = new TextDecoderStream();

        readableStream.pipeTo(textDecoderStream.writable);

        const reader: ReadableStreamDefaultReader<string> = textDecoderStream.readable.getReader();
        let done = false;
        let output: string = "";
        while (!done) {
            const v: ReadableStreamDefaultReadValueResult<string> | ReadableStreamDefaultReadDoneResult = await reader.read();
            done = v.done;
            if (!done) {
                output += v.value;
            }
        }
        expect(output).toBe("aaaaBaFFfffGGGtgrZTff");
    } else {
        expect(currentPath?.toAbsolutePath()?.getRoot()?.equals(rootPath?.toAbsolutePath())).toBeTruthy();
    }
});

test("LocalPathNewBufferedReader", async () => {
    const path = Paths.of("D:\\JAAJ.txt");
    if (os.platform() == "win32") {
        const readableStream: ReadableStream<string> = Files.newBufferedReader(path);
        const reader: ReadableStreamDefaultReader<string> = readableStream.getReader();
        let done = false;
        let output: string = "";
        while (!done) {
            const v: ReadableStreamDefaultReadValueResult<string> | ReadableStreamDefaultReadDoneResult = await reader.read();
            done = v.done;
            if (!done) {
                output += v.value;
            }
        }
        expect(output).toBe("aaaaBaFFfffGGGtgrZTff");
    } else {
        expect(currentPath?.toAbsolutePath()?.getRoot()?.equals(rootPath?.toAbsolutePath())).toBeTruthy();
    }
});

test("LocalPathNewBufferedReader", async () => {
    const path = Paths.of("D:\\JAAJ.txt");
    if (os.platform() == "win32") {
        const readableStream: ReadableStream<string> = Files.newBufferedReader(path);
        const reader: ReadableStreamDefaultReader<string> = readableStream.getReader();
        let done = false;
        let output: string = "";
        while (!done) {
            const v: ReadableStreamDefaultReadValueResult<string> | ReadableStreamDefaultReadDoneResult = await reader.read();
            done = v.done;
            if (!done) {
                output += v.value;
            }
        }
        expect(output).toBe("aaaaBaFFfffGGGtgrZTff");
    } else {
        expect(currentPath?.toAbsolutePath()?.getRoot()?.equals(rootPath?.toAbsolutePath())).toBeTruthy();
    }
});

test("LocalPathReadAllBytes", async () => {
    const path = Paths.of("D:\\JAAJ.txt");
    if (os.platform() == "win32") {
        expect((await Files.readAllBytes(path)).toString()).toEqual("97,97,97,97,66,97,70,70,102,102,102,71,71,71,116,103,114,90,84,102,102");
    } else {
        // TODO
    }
});

test("LocalPathReadString", async () => {
    const path = Paths.of("D:\\JAAJ.txt");
    if (os.platform() == "win32") {
        expect((await Files.readString(path))).toEqual("aaaaBaFFfffGGGtgrZTff");
    } else {
        //TODO
    }
});


