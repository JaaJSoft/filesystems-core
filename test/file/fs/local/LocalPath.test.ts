import {Paths} from "../../../../src/file/Paths";
import {LocalPath} from "../../../../src/file/fs/local/LocalPath";
import os from "os";

const rootPath = Paths.of("/");
const currentPath = Paths.of(".");

test('LocalPathRoot', () => {
    expect(rootPath.getRoot().equals(rootPath)).toBeTruthy()
})

test('LocalPathRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///"));
    expect(root.getRoot().equals(root)).toBeTruthy()
})

test('LocalPathNotRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///test.txt"));
    expect(root.getRoot().equals(root)).toBeFalsy()
})
test('LocalPathCurrentToAbsolutePath', () => {
    const absolutePath = currentPath.toAbsolutePath();
    expect(absolutePath.isAbsolute()).toBeTruthy();
    expect(absolutePath.getRoot().toURL().toString() === absolutePath.toURL().toString()).toBeFalsy()
})

test("LocalPathCurrentGetRoot", () => {
    expect(currentPath.getRoot()).toBeNull()
    if (os.platform() == "win32") {
        expect(currentPath.toAbsolutePath().getRoot()).toBeDefined()
    } else {
        expect(currentPath.toAbsolutePath().getRoot().equals(rootPath.toAbsolutePath())).toBeTruthy()
    }
})