import * as jsurl from "url";

test("jsURL", () => {
    expect(jsurl.fileURLToPath(jsurl.pathToFileURL("c:/"))).toEqual("c:\\");
});
