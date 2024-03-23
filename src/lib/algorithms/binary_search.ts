import { RecursiveCall, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { NumberList, NumberValue } from "$lib/core/values"


interface BinarySearchInput {
    array: NumberList
    target: NumberValue
    index: NumberValue
}


export class BinarySearchCall extends RecursiveCall<BinarySearchInput, NumberValue> {

    constructor (input: BinarySearchInput) {
        if (input.array.values.length === 0) {
            throw new Error("Please enter a non-empty array.")
        }
        else if (!input.array.values.every((v, i, a) => i === 0 || v.value >= a[i - 1].value)) {
            throw new Error("Array must be sorted")
        }
        else if (!input.index) {
            input.index = new NumberValue(0)
        }
        super(input)
    }

    case(): DivideCase<BinarySearchInput, NumberValue> | BaseCase<BinarySearchInput, NumberValue> {
        const array = this.input().array.values
        const target = this.input().target
        if (array.length === 1) {
            if (array[0].value === target.value) {
                return new BinarySearchFoundCase(this.input())
            }
            else {
                return new BinarySearchUnfoundCase(this.input())
            }
        } 
        else {
            const middle = Math.floor(array.length / 2)
            if (array[middle].value === target.value) {
                return new BinarySearchFoundCase(this.input())
            } 
            else {
                return new BinarySearchDivideCase(this.input())
            }
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: `We want to find the index of the target value ${this.input().target.value} in the array.`,
            valueKeyframes: [{
                "Array": new NumberList(this.input().array.values.map(v => new NumberValue(v.value))),
                "Target": new NumberValue(this.input().target.value)
            }]
        }]
    }

}


export class BinarySearchDivideCase extends DivideCase<BinarySearchInput, NumberValue> {

    divide(input: BinarySearchInput): RecursiveCalls<BinarySearchInput, NumberValue> {
        const array = input.array.values;
        const target = input.target.value;
        const middle = Math.floor(array.length / 2);
        if (array[middle].value < target) {
            return {
                "Right": new BinarySearchCall({
                    array: new NumberList(array.slice(middle + 1)),
                    target: input.target,
                    index: new NumberValue(input.index.value + middle + 1)
                }),
            }
        }
        else {
            return {
                "Left": new BinarySearchCall({
                    array: new NumberList(array.slice(0, middle)),
                    target: input.target,
                    index: input.index
                }),
            }
        }
    }
        
    combine(): NumberValue {
        return Object.values(this.calls())[0].result()
    }

    dividedDetails(input: BinarySearchInput): CallDetails {
        const middleIndex = Math.floor(input.array.values.length / 2);
        const middleValue = input.array.values[middleIndex];
        const callDetails: CallDetails =  [
            {
                text: `We check the element at the middle of the array. The value is ${middleValue.value}.`,
                valueKeyframes: [{
                    "Array": new NumberList(input.array.values.map((v, i) => 
                        v.copyDefault().coloured(i !== middleIndex ? "gray" : "red")
                    )),
                    "Midpoint": middleValue.copy().coloured("red"),
                }]
            },
        ];
        if (middleValue.value < input.target.value) {
            callDetails.push({
                text: `The target value ${input.target.value} is greater than the midpoint value. We discard the left half of the array.`,
                valueKeyframes: [{
                    "Array": new NumberList(input.array.values.map((v, i) => 
                        v.copy().coloured(i < middleIndex ? "gray" : i > middleIndex ? "blue" : "red").struckThrough(i < middleIndex)
                    )),
                    "Target": input.target.copy().coloured("green"),
                    "Midpoint": middleValue.copy().coloured("red"),
                }]
            })
        }
        else {
            callDetails.push({
                text: `The target value ${input.target.value} is less than the midpoint value. We discard the right half of the array.`,
                valueKeyframes: [{
                    "Array": new NumberList(input.array.values.map((v, i) => 
                        new NumberValue(v.value).coloured(i > middleIndex ? "gray" : i < middleIndex ? "blue" : "red").struckThrough(i > middleIndex)
                    )),
                    "Target": new NumberValue(input.target.value).coloured("green"),
                    "Midpoint": middleValue.copy().coloured("red"),
                }]
            })
        }
        return callDetails;
    }

    solvedDetails(input: BinarySearchInput): CallDetails {
        const resultIndex = this.result();
        const resultFound = resultIndex.value !== -1;
        if (resultFound) {
            const index = resultIndex.value - input.index.value;
            return [{
                text: `We return the index ${resultIndex.value}.`,
                valueKeyframes: [{
                    "Index": resultIndex.copy().coloured("green"),
                    "Array": new NumberList(input.array.values.map((v, i) => 
                        new NumberValue(v.value).coloured(i === index ? "green" : "gray").struckThrough(i !== index)
                    )),
                    "Target": new NumberValue(input.target.value).coloured("green"),
                }]
            }]
        }
        else {
            return [{
                text: `The target value ${input.target.value} was not found in the array.`,
                valueKeyframes: [{
                    "Array": new NumberList(input.array.values.map(v => 
                        v.copy().coloured("gray").struckThrough(true)
                    )),
                    "Target": new NumberValue(input.target.value).coloured("green"),
                }]
            }]
        }
    }

}

export class BinarySearchFoundCase extends BaseCase<BinarySearchInput, NumberValue> {

    solve(): NumberValue {
        return this.input().index
    }

    dividedDetails(input: BinarySearchInput): CallDetails {
        const index = this.solve().value - input.index.value;
        return [{
            text: `The target value ${input.target.value} matches the element at the mid. We have found the target at index ${this.solve().value}.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map((v, i) => 
                    new NumberValue(v.value).coloured(i === index ? "green" : "gray").struckThrough(i !== index)
                )),
                "Target": new NumberValue(input.target.value).coloured("green")
            }]
        }];
    }

    solvedDetails(input: BinarySearchInput): CallDetails {
        const index = this.solve().value - input.index.value;
        return [{
            text: `We return the index ${this.solve().value}.`,
            valueKeyframes: [{
                "Index": new NumberValue(this.solve().value).coloured("green"),
                "Array": new NumberList(input.array.values.map((v, i) => 
                    new NumberValue(v.value).coloured(i === index ? "green" : "gray").struckThrough(i !== index)
                )),
                "Target": new NumberValue(input.target.value).coloured("green"),
            }]
        }];
    }
}

export class BinarySearchUnfoundCase extends BaseCase<BinarySearchInput, NumberValue> {

    solve(): NumberValue {
        return new NumberValue(-1)
    }

    dividedDetails(input: BinarySearchInput): CallDetails {
        return [{
            text: `The only value remaining doesn't match our target.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map(v => 
                    new NumberValue(v.value).coloured("gray").struckThrough(true)
                )),
                "Target": new NumberValue(input.target.value).coloured("green")
            }]
        }];
    }

    solvedDetails(input: BinarySearchInput): CallDetails {
        return [{
            text: `The target ${input.target.value} was not found in the array.`,
            valueKeyframes: [{
                "Index": new NumberValue(this.solve().value).coloured("red"),
                "Array": new NumberList(input.array.values.map(v => 
                    new NumberValue(v.value).coloured("gray").struckThrough(true)
                )),
                "Target": new NumberValue(input.target.value).coloured("green"),
            }]
        }];
    }
}
