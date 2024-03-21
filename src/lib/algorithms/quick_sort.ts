import { RecursiveCall, DivideCase, BaseCase } from "$lib/core/recursive_call";
import type { CallDetails } from "$lib/core/recursive_call";
import { NumberList, NumberValue } from "$lib/core/values";

export interface QuickSortInput {
    array: NumberList;
}

export class QuickSortCall extends RecursiveCall<QuickSortInput, NumberList> {
    name(): string {
        return "Quick Sort";
    }

    case(): DivideCase<QuickSortInput, NumberList> | BaseCase<QuickSortInput, NumberList> {
        const array = this.input().array.values;
        if (array.length <= 1) {
            return new QuickSortBaseCase({ array: this.input().array });
        } else {
            const pivotIndex = Math.floor(array.length / 2);
            const pivot = array[pivotIndex].value;
            const left = new NumberList(array.filter((_, i) => i !== pivotIndex && _.value <= pivot));
            const right = new NumberList(array.filter((_, i) => i !== pivotIndex && _.value > pivot));
            return new QuickSortDivideCase(this.input(), {
                "Left": new QuickSortCall({ array: left }),
                "Right": new QuickSortCall({ array: right }),
            });
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to sort the given array using QuickSort.",
            valueKeyframes: [{
                "Array": new NumberList(this.input().array.values.map(v => new NumberValue(v.value)))
            }]
        }];
    }
}

export class QuickSortDivideCase extends DivideCase<QuickSortInput, NumberList> {

    combine(): NumberList {
        const pivotIndex = Math.floor(this.input().array.values.length / 2);
        const pivot = this.input().array.values[pivotIndex];
        return new NumberList([
            ...this.calls()["Left"].result().values,
            pivot,
            ...this.calls()["Right"].result().values
        ]);
    }

    dividedDetails(input: QuickSortInput): CallDetails {
        const array = input.array.copy().values
        const pivotIndex = Math.floor(array.length / 2)
        const pivot = array[pivotIndex].value
        const left: NumberValue[] = []
        const right: NumberValue[] = []
        const valueKeyframes = [{
            "Array": new NumberList(array.map(v => new NumberValue(v.value))),
            "Pivot": new NumberValue(pivot).coloured("purple"),
            "Left": new NumberList([]),
            "Right": new NumberList([])
        }]
        let i = 0
        while (array.length > 0) {
            if (i === pivotIndex) {
                array.shift()
            } else {
                const el = array.shift()!.value
                if (el <= pivot) {
                    left.push(new NumberValue(el).coloured("blue"))
                } else {
                    right.push(new NumberValue(el).coloured("red"))
                }
            }
            valueKeyframes.push({
                "Array": new NumberList(array.map(v => new NumberValue(v.value))),
                "Pivot": new NumberValue(pivot).coloured("purple"),
                "Left": new NumberList(left.slice()),
                "Right": new NumberList(right.slice())
            })
            i++
        }
        return [{
            text: `We choose the middle element ${pivot} as the pivot and partition the array into two subarrays.`,
            valueKeyframes
        }]
    }


    solvedDetails(input: QuickSortInput): CallDetails {
        const array = input.array.values;
        const pivotIndex = Math.floor(array.length / 2);
        const pivot = new NumberValue(array[pivotIndex].value).coloured("purple");
        const left = this.calls()["Left"].result().values.map(v => new NumberValue(v.value).coloured("blue"));
        const right = this.calls()["Right"].result().values.map(v => new NumberValue(v.value).coloured("red"));
        const sorted: NumberValue[] = [];
        
        // Start keyframe animation with the initial state
        const valueKeyframes = [{
            "Sorted": new NumberList([]),
            "Pivot": pivot,
            "Left": new NumberList(left),
            "Right": new NumberList(right),
        }];

        // Show concatenation of left side
        left.forEach(el => {
            sorted.push(el);
            valueKeyframes.push({
                "Sorted": new NumberList(sorted.map(v => new NumberValue(v.value).coloured("green"))),
                "Pivot": pivot,
                "Left": new NumberList(left.filter(l => l.value > el.value)), // Update left to remove added elements
                "Right": new NumberList(right), // Right remains unchanged for now
            });
        });

        // Add the pivot
        sorted.push(pivot);
        valueKeyframes.push({
            "Sorted": new NumberList(sorted.map(v => new NumberValue(v.value).coloured("green"))),
            "Pivot": new NumberValue(pivot.value).struckThrough(true),
            "Left": new NumberList([]), // Left is now empty
            "Right": new NumberList(right), // Right remains unchanged for now
        });

        // Show concatenation of right side
        right.forEach(el => {
            sorted.push(el);
            valueKeyframes.push({
                "Sorted": new NumberList(sorted.map(v => new NumberValue(v.value).coloured("green"))),
                "Pivot": new NumberValue(pivot.value).struckThrough(true),
                "Left": new NumberList([]), // Left remains empty
                "Right": new NumberList(right.filter(r => r.value > el.value)), // Update right to remove added elements
            });
        });

        return [{
            text: "We concatenate the sorted left subarray, the pivot, and the sorted right subarray to get the final sorted array.",
            valueKeyframes
        }];
    }

    
}

export class QuickSortBaseCase extends BaseCase<QuickSortInput, NumberList> {
    solve(): NumberList {
        return this.input().array;
    }

    dividedDetails(input: QuickSortInput): CallDetails {
        return [{
            text: `The array has 1 or fewer elements, so it is already sorted.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map(v => new NumberValue(v.value).coloured("green")))
            }]
        }];
    }

    solvedDetails(input: QuickSortInput): CallDetails {
        return [{
            text: `The array is already sorted.`,
            valueKeyframes: [{
                "Array": new NumberList(input.array.values.map(v => new NumberValue(v.value).coloured("green")))
            }]
        }];
    }
}
