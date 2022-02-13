import {Paths} from "../../src/file/Paths";
import * as os from 'os'

test('path', () => {
    expect(Paths.of("")).toBeNull();
    expect(Paths.of(".").isAbsolute()).toBeFalsy();
    expect(Paths.of(".").toString()).toEqual("");
    expect(Paths.of(".").toAbsolutePath().isAbsolute()).toBeTruthy();
    expect(Paths.of("/").toString()).toEqual("/");
    expect(Paths.of("/").toRealPath().isAbsolute()).toBeTruthy();
})

test("URL", () => {
    if (os.platform() == "win32") {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///D:/")
    } else {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///")
    }
})