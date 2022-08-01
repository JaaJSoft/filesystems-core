import {Paths} from "../../src/file";
import * as os from "os";

test("path", () => {
    expect(Paths.of("").toAbsolutePath().toString()).toBeDefined();
    expect(Paths.of(".").isAbsolute()).toBeFalsy();
    expect(Paths.of(".").toString()).toEqual(".");
    expect(Paths.of(".").toAbsolutePath().isAbsolute()).toBeTruthy();
    expect(Paths.of("/").toString()).toEqual("/");
    expect(Paths.of("/").toRealPath().isAbsolute()).toBeTruthy();
});

test("URL", () => {
    if (os.platform() == "win32") {
        expect(Paths.of("c:/").toURL().toString()).toEqual(Paths.of("c:/").toURL().toString());


        expect(Paths.of("c:/").toURL().toString()).toEqual("file:///c:/");
        expect(Paths.ofURL(new URL("file://D:/"))?.toURL().toString()).toEqual("file:///D:/");
    } else {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///");
        expect(Paths.ofURL(new URL("file:///"))?.toURL().toString()).toEqual("file:///");
    }
});
test("URL2", () => {
    if (os.platform() == "win32") {
        const url: string = Paths.of("c:/").toURL().toString();
        expect(Paths.ofURL(new URL(url)).equals(Paths.of("c:/")));
    }
});

test("test", () => {
    const set = new Set([1]);
    const it: IterableIterator<number> = set[Symbol.iterator]();
    const next: IteratorResult<number, any> = it.next();
    expect(next.done).toBeFalsy();
    expect(next.value).toEqual(1);
    const nex2 = it.next();
    expect(nex2.done).toBeTruthy();
    expect(nex2.value).toBeUndefined();
});


