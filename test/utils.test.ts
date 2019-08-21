import { sumBool } from '../src/utils';

describe('utils', () => {
    describe('sumBool', () => {
        const testCases: [boolean[], number][] = [
            [[], 0],
            [[true], 1],
            [[true, false], 1],
            [[false, true, true], 2],
            [[false, true, true, false, true], 3],
        ];

        testCases.forEach(([bools, result]) => {
            test(`check [${bools.join(', ')}]`, () => expect(sumBool(bools)).toBe(result));
        });
    });
});
