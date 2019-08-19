export type Primitives = string | number | symbol | boolean | object | undefined | bigint

export const mismatchMessage = Symbol('Symbol key `mismatchMessage` for `Matcher`');

export default interface Matcher<T> {
    (obj: unknown): obj is T;
    [mismatchMessage]?: (obj: unknown) => string;
}

type TupleOf<T> = [T, ...T[]];

interface RecursiveArray<T> {
    [K: number]: T | RecursiveArray<T> | RecursiveObject<T>;
}

interface RecursiveObject<T> {
    [K: string]: T | RecursiveArray<T> | RecursiveObject<T>;
}

type Recursive<T> = T | RecursiveArray<T> | RecursiveObject<T>;

export type MatchersToGuardedTypes<T> = {
    [K in keyof T]: T[K] extends Matcher<infer R> ? R : MatchersToGuardedTypes<T[K]>;
};

type AllowedTypes = string | number | Matcher<string | number>;

export type MatchType = <Container extends TupleOf<AllowedTypes>,  // some arcane type magic I found
    TTemplate extends Recursive<Container[number] | TupleOf<Container[number]>>,
    TPath extends string[],
    >(template: TTemplate, path?: TPath) =>
    (value: MatchersToGuardedTypes<TTemplate>) =>
        undefined extends typeof path ? boolean : void;
