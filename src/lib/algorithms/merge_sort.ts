import { RecursiveCall, RecursiveCase, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { NumberList, NumberValue } from "$lib/core/values"

export interface MergeSortInput {
    array: NumberList
}

export class MergeSortCall extends RecursiveCall<MergeSortInput, NumberList> {

    constructor(input: MergeSortInput, root: MergeSortCall | null = null) {
        if (input.array.values.length === 0) {
            throw new Error("Please enter at least one element.")
        }
        super(input, root)
    }

    case(input: MergeSortInput, root: MergeSortCall): RecursiveCase<MergeSortInput, NumberList> {
        if (input.array.values.length <= 1) {
            return new MergeSortBaseCase(input)
        } else {
            return new MergeCase(input, root)
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to sort the array using Merge Sort.",
            valueKeyframes: [{
                "Array": new NumberList(this.input().array.values.map(v => new NumberValue(v.value)))
            }]
        }]
    }

}

export class MergeCase extends DivideCase<MergeSortInput, NumberList> {

    divide(input: MergeSortInput, root: MergeSortCall): RecursiveCalls<MergeSortInput, NumberList> {
        const array = input.array.values
        const mid = Math.floor(array.length / 2)
        return {
            "Left": new MergeSortCall({
                array: new NumberList(array.slice(0, mid))
            }, root),
            "Right": new MergeSortCall({
                array: new NumberList(array.slice(mid))
            }, root)
        }
    }

    combine(): NumberList {
        const left = this.calls()["Left"].result().values
        const right = this.calls()["Right"].result().values
        const result: NumberValue[] = []
        let i = 0
        let j = 0
        while (i < left.length && j < right.length) {
            if (left[i].value < right[j].value) {
                result.push(left[i])
                i++
            } else {
                result.push(right[j])
                j++
            }
        }
        while (i < left.length) {
            result.push(left[i])
            i++
        }
        while (j < right.length) {
            result.push(right[j])
            j++
        }
        return new NumberList(result)
    }

    dividedDetails(_: MergeSortInput): CallDetails {
        return [{
            text: `We split the array into two halves.`,
            valueKeyframes: [{
                "Left": new NumberList(this.calls()["Left"].input().array.values.map(v => new NumberValue(v.value).coloured("blue"))),
                "Right": new NumberList(this.calls()["Right"].input().array.values.map(v => new NumberValue(v.value).coloured("red")))
            }]
        }]
    }

    solvedDetails(_: MergeSortInput): CallDetails {
        const left = this.calls()["Left"].result().values.slice()
        const right = this.calls()["Right"].result().values.slice()
        const merged: NumberValue[] = []
        const valueKeyframes = [{
            "Merged": new NumberList([]),
            "Left": new NumberList(left.map(v => new NumberValue(v.value).coloured("blue"))),
            "Right": new NumberList(right.map(v => new NumberValue(v.value).coloured("red"))),
        }]
        while (left.length + right.length > 0) {
            if (left.length > 0 && right.length > 0) {
                if (left[0].value < right[0].value) {
                    merged.push(left[0])
                    left.shift()
                } else {
                    merged.push(right[0])
                    right.shift()
                }
            } else if (left.length > 0) {
                merged.push(left[0])
                left.shift()
            } else {
                merged.push(right[0])
                right.shift()
            }
            valueKeyframes.push({
                "Merged": new NumberList(merged.map(v => new NumberValue(v.value).coloured("green"))),
                "Left": new NumberList(left.map(v => new NumberValue(v.value).coloured("blue"))),
                "Right": new NumberList(right.map(v => new NumberValue(v.value).coloured("red"))),
            })
        }
        return [{
            text: `We merge the two sorted halves in O(n) time.`,
            valueKeyframes
        }]
    }

}

export class MergeSortBaseCase extends BaseCase<MergeSortInput, NumberList> {
    solve(): NumberList {
        return this.input().array
    }

    dividedDetails(input: MergeSortInput): CallDetails {
        return [{
            text: `The array has only one element, so it is already sorted. This is our base case.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map(v => new NumberValue(v.value).coloured("gray")))
            }]
        }]
    }

    solvedDetails(input: MergeSortInput): CallDetails {
        return [{
            text: `We return the array.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map(v => new NumberValue(v.value).coloured("gray")))
            }]
        }]
    }
}
