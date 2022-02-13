import {Paths} from "../../src/file/Paths";

test('path', () => {
    expect(Paths.of("")).toBeNull();
    expect(Paths.of(".").isAbsolute()).toEqual(false);
    expect(Paths.of(".").toString()).toEqual("");
    expect(Paths.of(".").toAbsolutePath().isAbsolute()).toEqual(true);
    expect(Paths.of("/").toString()).toEqual("/");
})

test("URL", () => {
    expect(Paths.of("/").toURL().toString()).toEqual("file:///")
})