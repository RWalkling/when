export {}

declare global {
    interface Boolean {
        asnumber: number;
    }
}

Object.defineProperty(Boolean.prototype, 'asnumber', {
    get(): any {
        return this | 0;
    }
});
