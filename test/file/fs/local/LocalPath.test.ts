import {Files, Path, Paths} from "../../../../src/file";
import os from "os";
import {Objects} from "../../../../src/utils";

const rootPath: Path | null = Paths.of("/");
const currentPath: Path | null = Paths.of(".");

test('LocalPathRoot', () => {
    expect(rootPath?.getRoot()?.equals(rootPath)).toBeTruthy()
})

test('LocalPathRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///"));
    expect(root?.getRoot()?.equals(root)).toBeTruthy()
})

test('LocalPathNotRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///test.txt"));
    Objects.requireNonNullUndefined(root);
    expect(root?.getRoot()?.equals(root)).toBeFalsy()
})

test('LocalPathExists', () => {
    const nullPath = Paths.ofURL(new URL("file:///T:/"));
    expect(Files.exists(nullPath)).toBeFalsy();
})

test('LocalPathCurrentToAbsolutePath', () => {
    Objects.requireNonNullUndefined(currentPath);
    const absolutePath = currentPath?.toAbsolutePath();
    Objects.requireNonNullUndefined(absolutePath);
    expect(absolutePath?.isAbsolute()).toBeTruthy();
    expect(absolutePath?.getRoot()?.toURL().toString() === absolutePath?.toURL().toString()).toBeFalsy()
})

test("LocalPathCurrentGetRoot", () => {
    expect(currentPath?.getRoot()).toBeNull()
    if (os.platform() == "win32") {
        expect(currentPath?.toAbsolutePath().getRoot()).toBeDefined()
    } else {
        expect(currentPath?.toAbsolutePath()?.getRoot()?.equals(rootPath?.toAbsolutePath())).toBeTruthy()
    }
})
