export const StringConstMatcher = <T extends string>(template?: T) =>
    (value: unknown): value is T =>
        typeof value === 'string' && (template === undefined || template === value);
export const StringMatcher = (template?: string) => StringConstMatcher(template);

export const NumberConstMatcher = <T extends number>(template?: T) =>
    (value: unknown): value is T =>
        typeof value === 'number' && (template === undefined || template === value);
export const NumberMatcher = (template?: number) => NumberConstMatcher(template);

export const BooleanConstMatcher = <T extends boolean>(template?: T) =>
    (value: unknown): value is T =>
        typeof value === 'boolean' && (template === undefined || template === value);
export const BooleanMatcher = (template?: boolean) => BooleanConstMatcher(template);

export const SymbolMatcher = (template?: symbol) =>
    (value: unknown): value is symbol =>
        typeof value === 'symbol' && (template === undefined || template === value);

export const BigintMatcher = (template?: bigint) =>
    (value: unknown): value is bigint =>
        typeof value === 'bigint' && (template === undefined || template === value);

export const UndefinedMatcher = (template?: undefined) =>
    (value: unknown): value is undefined =>
        typeof value === 'undefined' && typeof template === 'undefined';

export const FunctionMatcher = <F extends (...args: unknown[]) => unknown>(template?: F) =>
    (value: unknown): value is F =>
        typeof value === 'function' && (
            template === undefined || (value as (...args: unknown[]) => unknown).length === template.length
        );
