import Matcher, { MatchType, mismatchMessage } from './types';
import boolswitch from '../boolswitch';

class ValueError implements Error {
    constructor(message: string) {
        this.message = message;
        this.name = 'ValueError';
    }

    message: string;
    name: string;
}

const throwValueMismatchError = (template: unknown, value: unknown, path: string[]) => {
    const pathString = path.length === 0 ? 'arguments' : `property \`${path.join('.')}\``;
    throw new ValueError(`Types of ${pathString} don\'t match. Template is \`${template}\`, but value is \`${value}\``);
};

const throwTypeofMismatchError = (template: unknown, value: unknown, path: string[]) => {
    const pathString = path.length === 0 ? 'arguments' : `property \`${path.join('.')}\``;
    throw new TypeError(`Types of ${pathString} don\'t match. Template has typeof ${typeof template}, but value has typeof ${typeof value}`);
};

const throwMatcherError = (matcher: Matcher<unknown>, value: unknown, path: string[]) => {
    const pathString = path.length === 0
        ? 'arguments'
        : `property \`${path.join('.')}\``;

    const getMismatchMessage = matcher[mismatchMessage];
    const valueString = getMismatchMessage === undefined
        ? matcher.name.length === 0
            ? `A matcher expected a different value than the actual \`${value}\``
            : `The matcher \`${matcher.name}\` expected a different value than the actual \`${value}\``
        : getMismatchMessage(value);

    throw new TypeError(`Types of ${pathString} don\'t match. ${valueString}`);
};

const match: MatchType = (template, path) => value => {
    const returnBool = path === undefined;

    if (typeof template !== 'function' && typeof template !== typeof value)
        return returnBool ? false as any : throwTypeofMismatchError(template, value, path!);

    switch (typeof template) {
        case 'string':
        case 'number':
        case 'symbol':
        case 'boolean':
        case 'bigint':
        case 'undefined':
            return boolswitch(template === value, returnBool, {
                first: () => undefined,
                both: () => true,
                second: () => false,
                neither: () => throwValueMismatchError(template, value, path!),
            });
        case 'function':
            return boolswitch((template as Matcher<unknown>)(value), returnBool, {
                first: () => undefined,
                both: () => true,
                second: () => false,
                neither: () => throwMatcherError(template as Matcher<unknown>, value, path!),
            });
        case 'object': {
            for (const [key, subtemplate] of Object.entries(template)) {
                const subpath = path === undefined ? path : path.concat([key]) as typeof path;
                const subvalue = value[key as keyof typeof value] as any;
                const matches = match(subtemplate, subpath)(subvalue);
                if (returnBool && !matches) return false;
            }

            return returnBool ? true : undefined;
        }
    }
};

export default match;
