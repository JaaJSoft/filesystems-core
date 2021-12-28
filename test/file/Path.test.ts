import {Path} from "../../src/file/Path";
import {LinkOption} from "../../src/file/LinkOption";

test('path', () => {
    expect(Path.of("")).toBeUndefined()
})