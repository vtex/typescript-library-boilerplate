import type { PureComponent } from 'react';
/**
 * A Branded Type for values parseable to number.
 */
export declare type NumberParseable = (number | string | boolean | PureComponent) & {
    readonly isNumberParseble: unique symbol;
};
/**
 * Check if value is parseable to number.
 * @example ```ts
 * isNumberParseable('AAAA');
 * //=> false
 *
 * isNumberParseable('100');
 * //=> true
 *
 * if (!isNumberParseable(value))
 *   throw new Error('Value can\'t be parseable to `Number`.')
 * return Number(value);
 * ```
 * @param value - An `unknown` value to be checked.
 */
export declare const isNumberParseable: (value: unknown) => value is NumberParseable;
//# sourceMappingURL=index.d.ts.map