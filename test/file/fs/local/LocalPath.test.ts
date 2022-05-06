import {Paths} from "../../../../src/file/Paths";
import {LocalPath} from "../../../../src/file/fs/local/LocalPath";
import os from "os";

test('LocalPathRoot', () => {
    const root = Paths.of("/");
    expect(root.getRoot().equals(root)).toBeTruthy()
})

test('LocalPathRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///"));
    expect(root.getRoot().equals(root)).toBeTruthy()
})

test('LocalPathNotRootWithURL', () => {
    const root = Paths.ofURL(new URL("file:///test.txt"));
    expect(root.getRoot().equals(root)).toBeFalsy()
})

test('LocalPathCurrent', () => {
    const current = Paths.of(".");
    const absolutePath = current.toAbsolutePath();
    expect(absolutePath.isAbsolute()).toBeTruthy();
    expect(absolutePath.getRoot().toURL().toString() === absolutePath.toURL().toString()).toBeFalsy()
})