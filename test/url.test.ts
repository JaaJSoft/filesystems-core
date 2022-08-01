import * as jsurl from "url";
import os from "os";

test("jsURL", () => {
    if (os.platform() == "win32") {
        expect(jsurl.fileURLToPath(jsurl.pathToFileURL("c:/"))).toEqual("c:\\");
    } else {
        expect(jsurl.fileURLToPath(jsurl.pathToFileURL("/"))).toEqual("/");
    }
});
