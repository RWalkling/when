import when, { typeofValues } from '../src/when';

describe('conditional', () => {
    describe('if', () => {
        const testCase = <TTruth, TTrue, TFalse>(truth: TTruth, ifTrue: TTrue, ifFalse: TFalse) => () => {
            const conditional = when()
            .if(truth, ifTrue)
            .if(!truth, ifFalse);

            expect(conditional.first()).toBe(truth ? ifTrue : ifFalse);
        };

        test('true', testCase(true, 'true', 'false'));
        test('false', testCase(false, 'true', 'false'));
        test('truthy', testCase('truthy', true, false));
        test('falsy', testCase(0, true, false));
        test('different types', testCase(true, 80, 's'));
        test('special types', testCase(false, null, undefined));
    });

    describe('first', () => {
        test('default if only default given', () => expect(when().first('default value')).toBe('default value'));

        const testCase = <T, TTruths extends T[]>(truths: TTruths, result: number | undefined) => () => {
            const conditional = truths.reduce(
                (conditional, truth, index) => conditional.if(truth, index) as any,
                when(),
            );

            expect(conditional.first()).toBe(result);
        };

        const cases: [boolean[], number | undefined][] = [
            [[], undefined],
            [[true], 0],
            [[false], undefined],
            [[true, false], 0],
            [[true, false, false], 0],
            [[false, true, false], 1],
            [[true, true, false], 0],
            [[false, false, false], undefined],
        ];

        cases.forEach(([truths, result]) => test(`check [${truths}]`, testCase(truths, result)));
    });

    describe('not', () => {
        const testCase = <TTruth, TTrue, TFalse>(truth: TTruth, ifTrue: TTrue, ifFalse: TFalse) => () => {
            const conditional = when()
            .if(false, undefined)
            .not.if(truth, ifFalse)
            .if(truth, ifTrue);

            expect(conditional.first()).toBe(truth ? ifTrue : ifFalse);
        };

        test('true', testCase(true, 'true', 'false'));
        test('false', testCase(false, 'true', 'false'));
    });

    describe('count', () => {
        const testCase = <T, TTruths extends T[]>(truths: TTruths, count: number) => () => {
            const conditional = truths.reduce(
                (conditional, truth) => conditional.if(truth),
                when(),
            );

            expect(conditional.count).toBe(count);
        };

        test('empty array', testCase([], 0));
        test('single element array (true)', testCase([true], 1));
        test('single element array (false)', testCase([false], 0));
        test('multi element array (2)', testCase([true, true], 2));
        test('multi element array (3)', testCase([true, true, true], 3));
        test('multi element array with false (2)', testCase([true, false], 1));
        test('multi element array with false (3)', testCase([true, false, true], 2));
    });

    describe('hasType', () => {
        const testCase = <T>(value: T) => () => {
            const conditional = typeofValues.reduce(
                (conditional, type) => conditional.hasType(type, type) as any,
                when(value),
            );
            expect(conditional.count).toBe(1);
            expect(conditional.first()).toBe(typeof value);
        };

        test('recognize string', testCase('str'));
        test('recognize NaN', testCase(NaN));
        test('recognize non-NaN number', testCase(1));
        test('recognize boolean', testCase(true));
        test('recognize undefined', testCase(undefined));
        test('recognize null', testCase(null));
        test('recognize array', testCase([]));
        test('recognize non-null non-array object', testCase({}));
        test('recognize bigint', testCase(BigInt(0)));
        test('recognize symbol', testCase(Symbol()));
        test('recognize arrow function', testCase(() => {
        }));
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        test('recognize function expression', testCase(function () {
        }));
    });

    // according to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#A_model_for_understanding_equality_comparisons
    const sameness = [
        [undefined, undefined, true, true, true, true],
        [null, null, true, true, true, true],
        [true, true, true, true, true, true],
        [false, false, true, true, true, true],
        ['foo', 'foo', true, true, true, true],
        [0, 0, true, true, true, true],
        [+0, -0, true, true, false, true],
        [+0, 0, true, true, true, true],
        [-0, 0, true, true, false, true],
        [0, false, true, false, false, false],
        ['', false, true, false, false, false],
        ['', 0, true, false, false, false],
        ['0', 0, true, false, false, false],
        ['17', 17, true, false, false, false],
        [[1, 2], '1,2', true, false, false, false],
        [new String('foo'), 'foo', true, false, false, false],
        [null, undefined, true, false, false, false],
        [null, false, false, false, false, false],
        [undefined, false, false, false, false, false],
        [{ foo: 'bar' }, { foo: 'bar' }, false, false, false, false],
        [new String('foo'), new String('foo'), false, false, false, false],
        [0, null, false, false, false, false],
        [0, NaN, false, false, false, false],
        ['foo', NaN, false, false, false, false],
        [NaN, NaN, false, false, true, true],
    ];

    describe('isEqual', () =>
        sameness.forEach(([first, second, double]) => {
            const conditional = when(first)
            .isEqual(second as any, true)
            .not.isEqual(second as any, false);
            test(`check ${first} === ${second}`, () => expect(conditional.first()).toBe(double));
        }),
    );

    describe('isIdentical', () =>
        sameness.forEach(([first, second, , tripple]) => {
            const conditional = when(first)
            .isIdentical(second as any, true)
            .not.isIdentical(second as any, false);
            test(`check ${first} == ${second}`, () => expect(conditional.first()).toBe(tripple));
        }),
    );

    describe('objectIs', () =>
        sameness.forEach(([first, second, , , is]) => {
            const conditional = when(first)
            .objectIs(second as any, true)
            .not.objectIs(second as any, false);
            test(`check Object.is(${first}, ${second})`, () => expect(conditional.first()).toBe(is));
        }),
    );
});
