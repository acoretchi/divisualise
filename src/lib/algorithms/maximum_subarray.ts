import { RecursiveCall, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails } from "$lib/core/recursive_call"
import { NumberList, NumberValue } from "$lib/core/values"


export interface MaximalSubarrayInput {
    array: NumberList
}


export class MaximalSubarrayCall extends RecursiveCall<MaximalSubarrayInput, NumberList> {

    constructor(input: MaximalSubarrayInput) {
        super(input)
        if (!input.array.values.every(val => Number.isInteger(val.value))) {
            throw new Error("Please enter only integers.")
        }
        if (input.array.values.length === 0) {
            throw new Error("Please enter at least one element.")
        }
    }

    case(): DivideCase<MaximalSubarrayInput, NumberList> | BaseCase<MaximalSubarrayInput, NumberList> {
        const array = this.input().array

        if (array.values.length === 1) {
            return new MaximalSubarrayBaseCase(this.input())
        } else {
            const mid = Math.floor(array.values.length / 2)
            return new MaximalSubarrayDivideCase(this.input(), {
                "Left": new MaximalSubarrayCall({ array: new NumberList(array.values.slice(0, mid)) }),
                "Right": new MaximalSubarrayCall({ array: new NumberList(array.values.slice(mid)) }),
            })
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to find the contiguous subarray with the largest sum.",
            valueKeyframes: [{
                "Array": new NumberList(this.input().array.values.map(val => new NumberValue(val.value)))
            }]
        }]
    }
    
}

export class MaximalSubarrayDivideCase extends DivideCase<MaximalSubarrayInput, NumberList> {

    combine(): NumberList {
        const array = this.input().array.copy().values
        const mid = Math.floor(array.length / 2)

        const leftSubarray = this.calls()["Left"].result().copy()
        const rightSubarray = this.calls()["Right"].result().copy()

        let leftSum = 0
        let maxLeftSum = -Infinity
        let maxLeftSubarray: NumberValue[] = []

        for (let i = mid - 1; i >= 0; i--) {
            leftSum += array[i].value
            if (leftSum > maxLeftSum) {
                maxLeftSum = leftSum
                maxLeftSubarray = array.slice(i, mid)
            }
        }

        let rightSum = 0
        let maxRightSum = -Infinity
        let maxRightSubarray: NumberValue[] = []

        for (let i = mid; i < array.length; i++) {
            rightSum += array[i].value
            if (rightSum > maxRightSum) {
                maxRightSum = rightSum
                maxRightSubarray = array.slice(mid, i + 1)
            }
        }

        const crossingSubarray = new NumberList([...maxLeftSubarray, ...maxRightSubarray])

        if (sum(leftSubarray).value >= sum(rightSubarray).value && 
            sum(leftSubarray).value >= maxLeftSum + maxRightSum) {
            return leftSubarray
        } else if (sum(rightSubarray).value >= sum(leftSubarray).value && 
            sum(rightSubarray).value >= maxLeftSum + maxRightSum) {
            return rightSubarray
        } else {
            return crossingSubarray
        }
    }

    dividedDetails(input: MaximalSubarrayInput): CallDetails {
        const mid = Math.floor(input.array.values.length / 2)
        return [
            {
                text: `We divide the array into two halves.`,
                valueKeyframes: [
                    {
                        "Left": new NumberList(input.array.values.slice(0, mid)
                            .map(val => new NumberValue(val.value).coloured("blue"))),
                        "Right": new NumberList(input.array.values.slice(mid)
                            .map(val => new NumberValue(val.value).coloured("red")))
                    }
                ]
            },
        ]
    }

    solvedDetails(_: MaximalSubarrayInput): CallDetails {
        const array = this.input().array.values
        const mid = Math.floor(array.length / 2)
        const leftSubarray = this.calls()["Left"].result().copy()
        const rightSubarray = this.calls()["Right"].result().copy()

        const valueKeyframes: { 
            "Crossing Subarray": NumberList,
            "Max Left Sum": NumberValue,
            "Max Right Sum": NumberValue
        }[] = [
            {
                "Crossing Subarray": new NumberList([]),
                "Max Left Sum": new NumberValue(-Infinity),
                "Max Right Sum": new NumberValue(-Infinity)
            }
        ]

        let leftSum = 0
        let maxLeftSum = -Infinity
        let maxLeftSubarray: NumberList = new NumberList([])

        for (let i = mid - 1; i >= 0; i--) {
            maxLeftSubarray.values.unshift(array[i].copy().coloured("gray"))
            leftSum += array[i].value
            if (leftSum > maxLeftSum) {
                maxLeftSum = leftSum
                maxLeftSubarray = maxLeftSubarray.coloured("blue")
            }
            valueKeyframes.push({
                "Crossing Subarray": maxLeftSubarray.copy(),
                "Max Left Sum": new NumberValue(maxLeftSum),
                "Max Right Sum": new NumberValue(-Infinity)
            })
        }

        let rightSum = 0
        let maxRightSum = -Infinity
        let maxRightSubarray: NumberList = new NumberList([])

        for (let i = mid; i < array.length; i++) {
            maxRightSubarray.values.push(array[i].copy().coloured("gray"))
            rightSum += array[i].value
            if (rightSum > maxRightSum) {
                maxRightSum = rightSum
                maxRightSubarray = maxRightSubarray.coloured("red")
            }
            valueKeyframes.push({
                "Crossing Subarray": new NumberList([
                    ...maxLeftSubarray.copy().values,
                    ...maxRightSubarray.copy().values
                ]),
                "Max Left Sum": new NumberValue(maxLeftSum),
                "Max Right Sum": new NumberValue(maxRightSum)
            })
        }

        const crossingSubarray = new NumberList([
            ...maxLeftSubarray.values,
            ...maxRightSubarray.values
        ])

        return [
            {
                text: "We find the maximal subarray that crosses the split.",
                valueKeyframes: valueKeyframes,
                highlightedCalls: ["Left", "Right"]
            },
            {
                text: "We find the maximal subarray that crosses the split.",
                valueKeyframes: [{
                    "Crossing Subarray": new NumberList(crossingSubarray.values
                        .map(val => new NumberValue(val.value).coloured("purple"))),
                }],
                highlightedCalls: ["Left", "Right"]
            },
            {
                text: "We look at the sum of the crossing subarray.",
                valueKeyframes: [
                    {
                        "Crossing Subarray": new NumberList(crossingSubarray.values
                            .map(val => new NumberValue(val.value).coloured("purple"))),
                        "Crossing Subarray Sum": new NumberValue(sum(crossingSubarray).value),
                    }
                ],
                highlightedCalls: ["Left", "Right"]
            },
            {
                text: "Next, we look at sum of the left maximum subarray.",
                valueKeyframes: [
                    {
                        "Left Subarray": new NumberList(leftSubarray.values
                            .map(val => new NumberValue(val.value).coloured("blue"))),
                        "Left Subarray Sum": new NumberValue(sum(leftSubarray).value),
                    },
                ],
                highlightedCalls: ["Left"]
            },
            {
                text: "Then, we look at the sum of the right maximum subarray.",
                valueKeyframes: [
                    {
                        "Right Subarray": new NumberList(rightSubarray.values
                            .map(val => new NumberValue(val.value).coloured("red"))),
                        "Right Subarray Sum": new NumberValue(sum(rightSubarray).value),

                    }
                ],
                highlightedCalls: ["Right"]
            },
            {
                text: "Finally, we compare the sums of the left, right, and crossing subarrays to find the overall maximal subarray.",
                valueKeyframes: [
                    {
                        "Left Subarray Sum": new NumberValue(sum(leftSubarray).value),
                        "Right Subarray Sum": new NumberValue(sum(rightSubarray).value),
                        "Crossing Subarray Sum": new NumberValue(leftSum + rightSum),
                    }
                ],
                highlightedCalls: ["Left", "Right"]
            },
            {
                text: "Finally, we compare the sums of the left, right, and crossing subarrays to find the overall maximal subarray.",
                valueKeyframes: [
                    {
                        "Maximal Subarray": new NumberList(this.result().values
                            .map(val => new NumberValue(val.value).coloured("green")))
                    }
                ]
            }
        ]
    }

}

export class MaximalSubarrayBaseCase extends BaseCase<MaximalSubarrayInput, NumberList> {

    solve(): NumberList {
        const array = this.input().array
        return array.values[0].value < 0 ? new NumberList([]) : array
    }

    dividedDetails(input: MaximalSubarrayInput): CallDetails {
        return [{
            text: `The array has only one element. This is our base case.`,
            valueKeyframes: [
                {
                    "Array": new NumberList(input.array.values
                        .map(val => new NumberValue(val.value).coloured("gray")))
                }
            ]
        }]
    }

    solvedDetails(input: MaximalSubarrayInput): CallDetails {
        const array = input.array
        return [{
            text: array.values[0].value < 0 ? 
                `The only element is negative, so the maximal subarray is empty.` : 
                `The only element is non-negative, so the maximal subarray is the array itself.`,
            valueKeyframes: [
                {
                    "Maximal Subarray": new NumberList(this.solve().values
                        .map(val => new NumberValue(val.value).coloured("green"))),
                    "Array": new NumberList(input.array.values
                        .map(val => new NumberValue(val.value).coloured("gray"))),
                }
            ]
        }]
    }

}


function sum(array: NumberList): NumberValue {
    return new NumberValue(array.values.reduce((acc, val) => acc + val.value, 0))
}
