import { RecursiveCall, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { NumberValue } from "$lib/core/values"


export interface FibonacciInput {
    n: NumberValue
}


export class FibonacciCall extends RecursiveCall<FibonacciInput, NumberValue> {

    constructor(input: FibonacciInput) {
        super(input)
        if (input.n.value < 1 || !Number.isInteger(input.n.value)) {
            throw new Error("Fibonacci is only defined for positive integers.")
        } else if (input.n.value > 10) {
            throw new Error("Please enter a number less than or equal to 10.")
        }
    }

    case(): SumCase | FibBaseCase {
        if (this.input().n.value <= 2) {
            return new FibBaseCase({
                n: this.input().n
            })
        } else {
            return new SumCase(this.input())
        }
    }

    undividedDetails(): CallDetails {
        const n = this.input().n.value
        let numberEnding = "th"
        if (n % 10 === 1) {
            numberEnding = "st"
        }
        else if (n % 10 === 2) {
            numberEnding = "nd"
        }
        else if (n % 10 === 3) {
            numberEnding = "rd"
        }
        return [{
            text: `We want to compute the ${n}${numberEnding} Fibonacci number.`,
            valueKeyframes: [{
                "N": new NumberValue(n)
            }]
        }]
    }

}


export class SumCase extends DivideCase<FibonacciInput, NumberValue> {

    divide(input: FibonacciInput): RecursiveCalls<FibonacciInput, NumberValue> {
        return {
            "First Summand": new FibonacciCall({ n: new NumberValue(input.n.value - 1) }),
            "Second Summand": new FibonacciCall({ n: new NumberValue(input.n.value - 2) })
        }
    }

    combine(): NumberValue {
        return new NumberValue(this.calls()["First Summand"].result().value + this.calls()["Second Summand"].result().value)
    }

    dividedDetails(input: FibonacciInput): CallDetails {
        const n = input.n.value
        return [{
            text: `${n} is greater than 2, so we break this down as Fibonacci(${n-1}) + Fibonacci(${n-2})`,
            valueKeyframes: [{
                "N": new NumberValue(n)
            }]
        }]
    }

    solvedDetails(input: FibonacciInput): CallDetails {
        const n = input.n.value
        let first_summand = this.calls()["First Summand"].result()
        let second_summand = this.calls()["Second Summand"].result()
        return [{
            text: `We sum Fibonacci(${n-1}) and Fibonacci(${n-2})to find Fibonacci(${n})`,
            highlightedCalls: ["First Summand", "Second Summand"],
            valueKeyframes: [{
                [`Fibonacci(${n})`]: new NumberValue(first_summand.value + second_summand.value),
                [`Fibonacci(${n-1})`]: first_summand.copy(),
                [`Fibonacci(${n-2})`]: second_summand.copy()
            }]
        }]
    }

}


export class FibBaseCase extends BaseCase<FibonacciInput, NumberValue> {

    solve(): NumberValue {
        return new NumberValue(1)
    }

    dividedDetails(input: FibonacciInput): CallDetails {
        const n = input.n.value
        return [{
            text: `${n} is less than or equal to 2. This is our base case.`,
            valueKeyframes: [{
                "N": new NumberValue(n)
            }]
        }]
    }

    solvedDetails(input: FibonacciInput): CallDetails {
        const n = input.n.value
        return [{
            text: `We return 1.`,
            valueKeyframes: [{
                "Result": new NumberValue(1)
            }]
        }]
    }

}
