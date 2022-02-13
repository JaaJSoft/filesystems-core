import {Paths} from "../../src/file/Paths";
import * as os from 'os'

test('path', () => {
    expect(Paths.of("")).toBeNull();
    expect(Paths.of(".").isAbsolute()).toEqual(false);
    expect(Paths.of(".").toString()).toEqual("");
    expect(Paths.of(".").toAbsolutePath().isAbsolute()).toEqual(true);
    expect(Paths.of("/").toString()).toEqual("/");
})

test("URL", () => {
    if (os.platform() == "win32") {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///D:/")
    } else {
        expect(Paths.of("/").toURL().toString()).toEqual("file:///")
    }
})