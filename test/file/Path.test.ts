import {Paths} from "../../src/file";
import * as os from 'os'

test('path', () => {
    expect(Paths.of("").toAbsolutePath().toString()).toBeDefined();
    expect(Paths.of(".").isAbsolute()).toBeFalsy();
    expect(Paths.of(".").toString()).toEqual(".");
    expect(Paths.of(".").toAbsolutePath().isAbsolute()).toBeTruthy();
    expect(Paths.of("/").toString()).toEqual("/");
    expect(Paths.of("/").toRealPath().isAbsolute()).toBeTruthy();
})

test("URL", () => {
    if (os.platform() == "win32") {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///D:/")
        expect(Paths.ofURL(new URL("file:///"))?.toURL().toString()).toEqual("file:///D:/")

    } else {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///")
        expect(Paths.ofURL(new URL("file:///"))?.toURL().toString()).toEqual("file:///")
    }
})
