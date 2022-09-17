test("test", () => {
    const set = new Set([1]);
    const it: IterableIterator<number> = set[Symbol.iterator]();
    const next: IteratorResult<number> = it.next();
    expect(next.done).toBeFalsy();
    expect(next.value).toEqual(1);
    const nex2 = it.next();
    expect(nex2.done).toBeTruthy();
    expect(nex2.value).toBeUndefined();
});


