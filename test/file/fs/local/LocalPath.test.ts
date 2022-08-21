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
    const root = Paths.ofURL(new URL(os.platform() === "win32" ? "file://c:/" : "file:///"));
    expect(root.getRoot()?.equals(root)).toBeTruthy();
});

test("LocalPathNotRootWithURL", () => {
    if (os.platform() === "win32") {
        const path = Paths.ofURL(new URL("file://D:/test.txt"));
        expect(path.getRoot()?.equals(rootPath)).toBeFalsy();
    }
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
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\inputstream.txt");

    } else {
        path = Paths.of("/tmp/inputstream.txt");
    }
    Files.deleteIfExists(path);
    await Files.writeString(path, "aaaaBaFFfffGGGtgrZTff");
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
    Files.deleteIfExists(path);
    expect(output).toBe("aaaaBaFFfffGGGtgrZTff");
});

test("LocalPathNewBufferedReader", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\bufferedRead.txt");
    } else {
        path = Paths.of("/tmp/bufferedRead.txt");
    }
    Files.deleteIfExists(path);
    await Files.writeString(path, "aaaaBaFFfffGGGtgrZTff");
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
    Files.deleteIfExists(path);
    expect(output).toBe("aaaaBaFFfffGGGtgrZTff");
});

test("LocalPathReadAllBytes", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\bytes.txt");
    } else {
        path = Paths.of("/tmp/bytes.txt");
    }
    Files.deleteIfExists(path);
    await Files.writeString(path, "aaaaBaFFfffGGGtgrZTff");
    expect((await Files.readAllBytes(path)).toString()).toEqual("97,97,97,97,66,97,70,70,102,102,102,71,71,71,116,103,114,90,84,102,102");
    Files.deleteIfExists(path);
});

test("LocalPathReadString", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\JAAJ.txt");
    } else {
        path = Paths.of("/tmp/JAAJ.txt");
    }
    Files.deleteIfExists(path);
    await Files.writeString(path, "aaaaBaFFfffGGGtgrZTff");
    expect((await Files.readString(path))).toEqual("aaaaBaFFfffGGGtgrZTff");
    Files.deleteIfExists(path);
});

test("LocalPathReadAllString", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\JAAJ2.txt");
    } else {
        path = Paths.of("/tmp/JAAJ2.txt");
    }
    Files.deleteIfExists(path);
    await Files.writeString(path, "aaaaBaFFfffGGGtgrZTff\ntest");
    const lines: string[] = await Files.readAllLines(path);
    expect(lines.length).toEqual(2);
    expect(lines[0]).toEqual("aaaaBaFFfffGGGtgrZTff");
    expect(lines[1]).toEqual("test");
    Files.deleteIfExists(path);
});

test("LocalPathNewBufferedWriter", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\JAAJ3.txt");
    } else {
        path = Paths.of("/tmp/JAAJ3.txt");
    }
    const writableStream: WritableStream<string> = Files.newBufferedWriter(path);
    const writer: WritableStreamDefaultWriter<string> = writableStream.getWriter();
    await writer.write("test");
    await writer.releaseLock();
    await writableStream.close();
    expect(await Files.readString(path)).toEqual("test");
    Files.deleteIfExists(path);
});

test("LocalPathWriteString", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\JAAJ4.txt");
    } else {
        path = Paths.of("/tmp/JAAJ4.txt");
    }
    await Files.writeString(path, "test");
    expect(await Files.readString(path)).toEqual("test");
    Files.deleteIfExists(path);
});

test("LocalPathWriteBytes", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("D:\\JAAJ5.txt");
    } else {
        path = Paths.of("/tmp/JAAJ5.txt");
    }
    await Files.writeBytes(path, Uint8Array.of(1, 2, 3, 4));
    expect((await Files.readAllBytes(path)).toString()).toEqual("1,2,3,4");
    Files.deleteIfExists(path);
});

test("LocalPathDirectoryStream", async () => {
    let path: Path;
    if (os.platform() == "win32") {
        path = Paths.of("C:\\Users");
        const files = [...Files.newDirectoryStream(path, p => p ? p.toString().endsWith(".ini") : false)];
        expect(files.length).toEqual(1);
    } else {
        path = Paths.of("/tmp/");
        // TODO make a better test
    }
});
