import { RecursiveCall, RecursiveCase, DivideCase, BaseCase } from "$lib/core/recursive_call";
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call";
import { NumberList, NumberValue } from "$lib/core/values";

export interface LCSInput {
    first: NumberList;
    second: NumberList;
}

export class LCSCall extends RecursiveCall<LCSInput, NumberList> {

    constructor(input: LCSInput, root: LCSCall | null = null) {
        if (input.first.values.length + input.second.values.length > 8) {
            throw new Error("Please enter at most 8 elements between the two lists.")
        }
        super(input, root)
    }

    isMemoisable(): boolean { return true; }

    case(root: LCSCall): RecursiveCase<LCSInput, NumberList> {
        const first = this.input().first.values;
        const second = this.input().second.values;
        if (first.length === 0 || second.length === 0) {
            return new LCSBaseCase(this.input());
        } else {
            return new LCSDivideCase(this.input(), root);
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to find the longest common subsequence between the two lists.",
            valueKeyframes: [{
                "First": new NumberList(this.input().first.values.map(v => new NumberValue(v.value))),
                "Second": new NumberList(this.input().second.values.map(v => new NumberValue(v.value)))
            }]
        }];
    }
}

export class LCSDivideCase extends DivideCase<LCSInput, NumberList> {
    divide(input: LCSInput, root: LCSCall): RecursiveCalls<LCSInput, NumberList> {
        const first = input.first.values;
        const second = input.second.values;
        const lastIndex1 = first.length - 1;
        const lastIndex2 = second.length - 1;
        const lastElement1 = first[lastIndex1];
        const lastElement2 = second[lastIndex2];
        if (lastElement1.value === lastElement2.value) {
            return {
                "Subproblem": new LCSCall({
                    first: new NumberList(first.slice(0, lastIndex1)),
                    second: new NumberList(second.slice(0, lastIndex2))
                }, root)
            };
        } else {
            return {
                "Subproblem 1": new LCSCall({
                    first: new NumberList(first.slice(0, lastIndex1)),
                    second: new NumberList(second)
                }, root),
                "Subproblem 2": new LCSCall({
                    first: new NumberList(first),
                    second: new NumberList(second.slice(0, lastIndex2))
                }, root)
            };
        }
    }

    combine(): NumberList {
        const first = this.input().first.values;
        const second = this.input().second.values;
        const lastElement1 = first[first.length - 1];
        const lastElement2 = second[second.length - 1];
        if (lastElement1.value === lastElement2.value) {
            return new NumberList([
                ...this.calls()["Subproblem"].result().values,
                lastElement1
            ]);
        } else {
            const subproblem1 = this.calls()["Subproblem 1"].result().values;
            const subproblem2 = this.calls()["Subproblem 2"].result().values;
            return subproblem1.length > subproblem2.length ?
                new NumberList(subproblem1) :
                new NumberList(subproblem2);
        }
    }

    dividedDetails(input: LCSInput): CallDetails {
        const first = input.first.values;
        const second = input.second.values;
        const lastIndex1 = first.length - 1;
        const lastIndex2 = second.length - 1;
        const lastElement1 = first[lastIndex1];
        const lastElement2 = second[lastIndex2];
        if (lastElement1.value === lastElement2.value) {
            return [{
                text: `Both final elements are equal to ${lastElement1.value}, so we include them in the LCS and solve the subproblem without these elements.`,
                valueKeyframes: [{
                    "First": new NumberList([
                        ...first.slice(0, lastIndex1).map(v => new NumberValue(v.value).coloured("gray")),
                        lastElement1.copy().coloured("green")
                    ]),
                    "Second": new NumberList([
                        ...second.slice(0, lastIndex2).map(v => new NumberValue(v.value).coloured("gray")),
                        lastElement2.copy().coloured("green")
                    ])
                }]
            }];
        } else {
            return [{
                text: `The last elements are not equal so we discard them and solve two subproblems, one without each last element.`,
                valueKeyframes: [{
                    "First": new NumberList([
                        ...first.slice(0, lastIndex1).map(v => new NumberValue(v.value).coloured("gray")),
                        lastElement1.copy().coloured("red")
                    ]),
                    "Second": new NumberList([
                        ...second.slice(0, lastIndex2).map(v => new NumberValue(v.value).coloured("gray")),
                        lastElement2.copy().coloured("red")
                    ])
                }]
            }];
        }
    }

    solvedDetails(input: LCSInput): CallDetails {
        const first = input.first.values;
        const second = input.second.values;
        const lastElement1 = first[first.length - 1];
        const lastElement2 = second[second.length - 1];
        const lcs = this.result().values;
        if (lastElement1.value === lastElement2.value) {
            return [{
                text: `We take the longest subproblem sequence and concatenate our common final element ${lastElement1.value}.`,
                valueKeyframes: [{
                    "LCS": new NumberList(lcs.map(v => new NumberValue(v.value).coloured("green"))),
                    "First": new NumberList(first.map(v => 
                        lcs.includes(v) ? new NumberValue(v.value).coloured("green") : new NumberValue(v.value).coloured("gray")
                    )),
                    "Second": new NumberList(second.map(v =>
                        lcs.includes(v) ? new NumberValue(v.value).coloured("green") : new NumberValue(v.value).coloured("gray")
                    ))
                }]
            }];
        } else {
            return [{
                text: `The final elements of our input are not equal, so we just return the longest LCS from the two subproblems.`,
                valueKeyframes: [{
                    "LCS": new NumberList(lcs.map(v => new NumberValue(v.value).coloured("green"))),
                    "First": new NumberList(first.map(v =>
                        lcs.includes(v) ? new NumberValue(v.value).coloured("green") : new NumberValue(v.value).coloured("gray")
                    )),
                    "Second": new NumberList(second.map(v =>
                        lcs.includes(v) ? new NumberValue(v.value).coloured("green") : new NumberValue(v.value).coloured("gray")
                    ))
                }]
            }];
        }
    }
}

export class LCSBaseCase extends BaseCase<LCSInput, NumberList> {
    solve(): NumberList {
        return new NumberList([]);
    }

    dividedDetails(input: LCSInput): CallDetails {
        return [{
            text: `One of the lists is empty, so the longest common subsequence is the empty list.`,
            valueKeyframes: [{
                "First": new NumberList(input.first.values.map(v => new NumberValue(v.value).coloured("gray"))),
                "Second": new NumberList(input.second.values.map(v => new NumberValue(v.value).coloured("gray")))
            }]
        }];
    }

    solvedDetails(input: LCSInput): CallDetails {
        return [{
            text: `The longest common subsequence of an empty list and any other list is an empty list.`,
            valueKeyframes: [{
                "LCS": new NumberList([]),
                "First": new NumberList(input.first.values.map(v => new NumberValue(v.value).coloured("gray"))),
                "Second": new NumberList(input.second.values.map(v => new NumberValue(v.value).coloured("gray")))
            }]
        }];
    }
}
