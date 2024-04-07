import { RecursiveCall, RecursiveCase, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { NumberValue } from "$lib/core/values"


export interface KaratsubaInput {
    x: NumberValue
    y: NumberValue
}


export class KaratsubaCall extends RecursiveCall<KaratsubaInput, NumberValue> {

    constructor(input: KaratsubaInput, root: KaratsubaCall | null = null) {
        if (input.x.value < 0 || input.y.value < 0) {
            throw new Error("Please enter positive numbers.")
        }
        if (!Number.isInteger(input.x.value) || !Number.isInteger(input.y.value)) {
            throw new Error("Please enter integers.")
        }
        if (input.x.value > 9999999 || input.y.value > 9999999) {
            throw new Error("Please enter numbers less than 10,000,000.")
        }
        super(input, root)
    }
        
    case(
        input: KaratsubaInput,
        root: KaratsubaCall
    ): RecursiveCase<KaratsubaInput, NumberValue> {
        const x = input.x.value
        const y = input.y.value
        if (x < 10 || y < 10) {
            return new KaratsubaBaseCase(input)
        } else {
            return new KaratsubaDivideCase(input, root)
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to multiply two numbers x and y using Karatsuba's algorithm.",
            valueKeyframes: [{
                "x": new NumberValue(this.input().x.value),
                "y": new NumberValue(this.input().y.value)
            }]
        }]
    }

}


export class KaratsubaDivideCase extends DivideCase<KaratsubaInput, NumberValue> {

    divide(input: KaratsubaInput, root: KaratsubaCall): RecursiveCalls<KaratsubaInput, NumberValue> {
        const n = Math.max(Math.floor(Math.log10(input.x.value)) + 1, Math.floor(Math.log10(input.y.value)) + 1)
        const half = Math.floor(n / 2)
        const divisor = Math.pow(10, half)

        const a = Math.floor(input.x.value / divisor)
        const b = input.x.value % divisor
        const c = Math.floor(input.y.value / divisor)
        const d = input.y.value % divisor

        return {
            "ac": new KaratsubaCall({ x: new NumberValue(a), y: new NumberValue(c) }, root),
            "bd": new KaratsubaCall({ x: new NumberValue(b), y: new NumberValue(d) }, root),
            "(a+b)(c+d)": new KaratsubaCall({ x: new NumberValue(a + b), y: new NumberValue(c + d) }, root)
        }
    }

    combine(): NumberValue {
        const ac = this.calls()["ac"].result()
        const bd = this.calls()["bd"].result()
        const abcd = this.calls()["(a+b)(c+d)"].result()

        const n = Math.max(Math.floor(Math.log10(this.input().x.value)) + 1, Math.floor(Math.log10(this.input().y.value)) + 1)
        const half = Math.floor(n / 2)
        const divisor = Math.pow(10, half)

        const adPlusBC = new NumberValue(abcd.value - ac.value - bd.value)

        return new NumberValue(ac.value * Math.pow(10, 2 * half) + adPlusBC.value * divisor + bd.value)
    }

    dividedDetails(input: KaratsubaInput): CallDetails {
        const n = Math.max(Math.floor(Math.log10(input.x.value)) + 1, Math.floor(Math.log10(input.y.value)) + 1)
        const half = Math.floor(n / 2)
        const divisor = Math.pow(10, half)

        const a = Math.floor(input.x.value / divisor)
        const b = input.x.value % divisor
        const c = Math.floor(input.y.value / divisor)
        const d = input.y.value % divisor

        return [
            {
                text: "We divide x and y into two halves each: a and b for x, c and d for y.",
                valueKeyframes: [{
                    "x": new NumberValue(input.x.value),
                    "y": new NumberValue(input.y.value)
                }]
            },
            {
                text: "a is the left half and b is the right half of x.",
                valueKeyframes: [{
                    "x": new NumberValue(input.x.value),
                    "a": new NumberValue(a),
                    "b": new NumberValue(b)
                }]
            },
            {
                text: "c is the left half and d is the right half of y.",
                valueKeyframes: [{
                    "y": new NumberValue(input.y.value),
                    "c": new NumberValue(c),
                    "d": new NumberValue(d)
                }]
            },
            {
                text: "We recursively calculate ac, bd, and (a+b)(c+d).",
                valueKeyframes: [{
                    "a": new NumberValue(a),
                    "b": new NumberValue(b),
                    "c": new NumberValue(c),
                    "d": new NumberValue(d)
                }],
                highlightedCalls: ["ac", "bd", "(a+b)(c+d)"]
            }
        ]
    }

    solvedDetails(input: KaratsubaInput): CallDetails {
        const ac = this.calls()["ac"].result()
        const bd = this.calls()["bd"].result()
        const abcd = this.calls()["(a+b)(c+d)"].result()

        const n = Math.max(Math.floor(Math.log10(input.x.value)) + 1, Math.floor(Math.log10(input.y.value)) + 1)
        const half = Math.floor(n / 2)
        const divisor = Math.pow(10, half)

        const adPlusBC = new NumberValue(abcd.value - ac.value - bd.value)

        return [
            {
                text: "We have calculated ac, bd, and (a+b)(c+d).",
                valueKeyframes: [{
                    "ac": new NumberValue(ac.value),
                    "bd": new NumberValue(bd.value),
                    "(a+b)(c+d)": new NumberValue(abcd.value)
                }]
            },
            {
                text: "We calculate (ad + bc) by subtracting ac and bd from (a+b)(c+d).",
                valueKeyframes: [{
                    "(a+b)(c+d)": new NumberValue(abcd.value),
                    "ac": new NumberValue(ac.value),
                    "bd": new NumberValue(bd.value),
                    "ad + bc": new NumberValue(adPlusBC.value)
                }]
            },
            {
                text: "We combine the results of our subcalls to get the final result:",
                valueKeyframes: [{
                    "Result": new NumberValue(ac.value * Math.pow(10, 2 * half) + adPlusBC.value * divisor + bd.value),
                    "ac * 10^(2n)": new NumberValue(ac.value * Math.pow(10, 2 * half)),
                    "(ad + bc) * 10^n": new NumberValue(adPlusBC.value * divisor),
                    "bd": new NumberValue(bd.value)
                }]
            },
        ]
    }

}


export class KaratsubaBaseCase extends BaseCase<KaratsubaInput, NumberValue> {

    solve(): NumberValue {
        return new NumberValue(this.input().x.value * this.input().y.value)
    }

    dividedDetails(input: KaratsubaInput): CallDetails {
        return [{
            text: `One of the numbers has only one digit, so we can multiply them directly.`,
            valueKeyframes: [{
                "x": new NumberValue(input.x.value),
                "y": new NumberValue(input.y.value)
            }]
        }]
    }

    solvedDetails(input: KaratsubaInput): CallDetails {
        return [{
            text: "We return the product of the two numbers.",
            valueKeyframes: [{
                "Product": new NumberValue(this.solve().value),
                "x": new NumberValue(input.x.value),
                "y": new NumberValue(input.y.value),
            }]
        }]
    }

}
