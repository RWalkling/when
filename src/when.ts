import sumBy from 'lodash/sumBy';
import defunc, { Funcy, Defunced, fmap } from '@gecks/funcy';

export const typeofValues = ['string', 'number', 'bigint', 'boolean', 'symbol', 'undefined', 'object', 'function'] as const;
export type TypeofValues = typeof typeofValues[number];

export class Conditional<TValue, TResult = never> {
    private readonly value?: TValue;
    private truths: Array<[Funcy<boolean>, Funcy<TResult>?]> = [];
    private negated = false;

    constructor(value?: TValue) {
        this.value = value;
    }

    private register<TTruth extends Funcy<boolean>, TThen>(
        truth: TTruth,
        then?: TThen,
    ): Conditional<TValue, TResult | Defunced<TThen>> {
        const negated = this.negated;
        this.negated = false;
        const mayNegate = fmap(truth, t => negated ? !t : t);
        this.truths.push([mayNegate, then as any]);
        return this as any;
    }

    private getTruth<TEntry extends [Funcy<boolean>, Funcy<TResult>?]>(entry: TEntry) {
        return entry[0] = defunc(entry[0]);
    }

    public get not(): this {
        this.negated = true;
        return this;
    }

    public hasType<TType extends TypeofValues, TThen>(
        type: TType,
        then?: TThen,
    ): Conditional<TValue, TResult | Defunced<TThen>> {
        return this.register(typeof this.value === type, then);
    }

    public isIdentical = <TThen>(value: TValue, then?: TThen): Conditional<TValue, TResult | Defunced<TThen>> => {
        return this.register(this.value === value, then);
    };

    public isEqual = <TThen>(value: TValue, then?: TThen): Conditional<TValue, TResult | Defunced<TThen>> => {
        return this.register(() => this.value == value, then);
    };

    public objectIs = <TThen>(value: TValue, then?: TThen): Conditional<TValue, TResult | Defunced<TThen>> => {
        return this.register(() => Object.is(this.value, value), then);
    };

    public if = <TCondition, TThen>(
        condition: TCondition,
        then?: TThen,
    ): Conditional<TValue, TResult | Defunced<TThen>> => {
        return this.register(() => !!defunc(condition), then);
    };

    public first<TDefault = never>(otherwise?: TDefault): TResult | Defunced<TDefault> | undefined {
        for (const entry of this.truths) {
            if (this.getTruth(entry)) return defunc(entry[1]) as TResult | undefined;
        }
        return defunc(otherwise);
    }

    public or = this.first;

    public firstFalse<TDefault>(otherwise?: TDefault): TResult | Defunced<TDefault> | undefined {
        for (const entry of this.truths) {
            if (!this.getTruth(entry)) return defunc(entry[1]) as TResult | undefined;
        }
        return defunc(otherwise);
    }

    public and = this.firstFalse;

    get count() {
        return sumBy(this.truths, this.getTruth as any) | 0;
    }
}

export default <T = never>(value?: T) => new Conditional(value);
