import {Paths} from "../../../../src/file/Paths";
import {LocalPath} from "../../../../src/file/fs/local/LocalPath";

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