import { RecursiveCall, RecursiveCase, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { Matrix, NumberValue } from "$lib/core/values"


export interface StrassenInput {
    A: Matrix
    B: Matrix
}


export class StrassenCall extends RecursiveCall<StrassenInput, Matrix> {

    constructor(input: StrassenInput, root: StrassenCall | null = null) {
        if (input.A.matrix.length !== input.A.matrix[0].length || input.B.matrix.length !== input.B.matrix[0].length) {
            throw new Error("Please enter square matrices.")
        }
        if (input.A.matrix.length !== input.B.matrix.length) {
            throw new Error("The matrices must have the same size.")
        }
        if (input.A.matrix.length % 2 !== 0) {
            throw new Error("The matrices must have a size that is a power of 2.")
        }
        super(input, root)
    }
    
    case(root: StrassenCall): RecursiveCase<StrassenInput, Matrix> {
        const n = this.input().A.matrix.length
        if (n === 2) {
            return new StrassenBaseCase(this.input())
        } else {
            return new StrassenDivideCase(this.input(), root)
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to multiply two matrices A and B using Strassen's algorithm.",
            valueKeyframes: [{
                "A": this.input().A,
                "B": this.input().B
            }]
        }]
    }
}


export class StrassenDivideCase extends DivideCase<StrassenInput, Matrix> {

    divide(input: StrassenInput, root: StrassenCall): RecursiveCalls<StrassenInput, Matrix> {
        const A = input.A.matrix
        const B = input.B.matrix
        const n = A.length
        const mid = n / 2

        const A11 = A.slice(0, mid).map(row => row.slice(0, mid))
        const A12 = A.slice(0, mid).map(row => row.slice(mid))
        const A21 = A.slice(mid).map(row => row.slice(0, mid))
        const A22 = A.slice(mid).map(row => row.slice(mid))

        const B11 = B.slice(0, mid).map(row => row.slice(0, mid))
        const B12 = B.slice(0, mid).map(row => row.slice(mid))
        const B21 = B.slice(mid).map(row => row.slice(0, mid))
        const B22 = B.slice(mid).map(row => row.slice(mid))

        return {
            "M1": new StrassenCall({ 
                A: new Matrix(add(A11, A22)), 
                B: new Matrix(add(B11, B22))
            }, root),
            "M2": new StrassenCall({ 
                A: new Matrix(add(A21, A22)), 
                B: new Matrix(B11)
            }, root),
            "M3": new StrassenCall({ 
                A: new Matrix(A11), 
                B: new Matrix(subtract(B12, B22))
            }, root),
            "M4": new StrassenCall({ 
                A: new Matrix(A22), 
                B: new Matrix(subtract(B21, B11))
            }, root),
            "M5": new StrassenCall({ 
                A: new Matrix(add(A11, A12)), 
                B: new Matrix(B22)
            }, root),
            "M6": new StrassenCall({ 
                A: new Matrix(subtract(A21, A11)), 
                B: new Matrix(add(B11, B12))
            }, root),
            "M7": new StrassenCall({ 
                A: new Matrix(subtract(A12, A22)), 
                B: new Matrix(add(B21, B22))
            }, root)
        }
    }

    combine(): Matrix {
        const M1 = this.calls()["M1"].result().matrix
        const M2 = this.calls()["M2"].result().matrix
        const M3 = this.calls()["M3"].result().matrix
        const M4 = this.calls()["M4"].result().matrix
        const M5 = this.calls()["M5"].result().matrix
        const M6 = this.calls()["M6"].result().matrix
        const M7 = this.calls()["M7"].result().matrix

        const C11 = add(subtract(add(M1, M4), M5), M7)
        const C12 = add(M3, M5)
        const C21 = add(M2, M4)
        const C22 = add(subtract(add(M1, M3), M2), M6)

        return new Matrix([
            ...C11.map((row, i) => [...row, ...C12[i]]),
            ...C21.map((row, i) => [...row, ...C22[i]])
        ])
    }

    dividedDetails(input: StrassenInput): CallDetails {
        return [{
            text: "We divide matrices A and B into equally sized block matrices.",
            valueKeyframes: [{
                "A": input.A,
                "B": input.B
            }]
        }]
    }

    solvedDetails(_: StrassenInput): CallDetails {
        const M1 = this.calls()["M1"].result().matrix
        const M2 = this.calls()["M2"].result().matrix
        const M3 = this.calls()["M3"].result().matrix
        const M4 = this.calls()["M4"].result().matrix
        const M5 = this.calls()["M5"].result().matrix
        const M6 = this.calls()["M6"].result().matrix
        const M7 = this.calls()["M7"].result().matrix
        const C11 = add(subtract(add(M1, M4), M5), M7)
        const C12 = add(M3, M5)
        const C21 = add(M2, M4)
        const C22 = add(subtract(add(M1, M3), M2), M6)

        return [
            {
                text: "We calculate C11 = M1 + M4 - M5 + M7.",
                valueKeyframes: [{
                    "C11": new Matrix(C11.map(row => row.map(val => new NumberValue(val.value).coloured("red")))),
                    "M1": this.calls()["M1"].result().copy(),
                    "M4": this.calls()["M4"].result().copy(),
                    "M5": this.calls()["M5"].result().copy(),
                    "M7": this.calls()["M7"].result().copy()
                }],
                highlightedCalls: ["M1", "M4", "M5", "M7"]
            },
            {
                text: "We calculate C12 = M3 + M5.",
                valueKeyframes: [{
                    "C12": new Matrix(C12.map(row => row.map(val => new NumberValue(val.value).coloured("blue")))),
                    "M3": this.calls()["M3"].result().copy(),
                    "M5": this.calls()["M5"].result().copy()
                }],
                highlightedCalls: ["M3", "M5"]
            },
            {
                text: "We calculate C21 = M2 + M4.",
                valueKeyframes: [{
                    "C21": new Matrix(C21.map(row => row.map(val => new NumberValue(val.value).coloured("yellow")))),
                    "M2": this.calls()["M2"].result().copy(),
                    "M4": this.calls()["M4"].result().copy()
                }],
                highlightedCalls: ["M2", "M4"],
            },
            {
                text: "We calculate C22 = M1 - M2 + M3 + M6.",
                valueKeyframes: [{
                    "C22": new Matrix(C22.map(row => row.map(val => new NumberValue(val.value).coloured("green")))),
                    "M1": this.calls()["M1"].result().copy(),
                    "M2": this.calls()["M2"].result().copy(),
                    "M3": this.calls()["M3"].result().copy(),
                    "M6": this.calls()["M6"].result().copy()
                }],
                highlightedCalls: ["M1", "M2", "M3", "M6"]
            },
            {
                text: "And now recombining our block matrices, we get the result.",
                valueKeyframes: [{
                    "C": new Matrix([
                        ...C11.map((row, i) => [...row.map(val => new NumberValue(val.value).coloured("red")), ...C12[i].map(val => new NumberValue(val.value).coloured("blue"))]),
                        ...C21.map((row, i) => [...row.map(val => new NumberValue(val.value).coloured("yellow")), ...C22[i].map(val => new NumberValue(val.value).coloured("green"))])
                    ]),
                }]
            }
        ]
    }
}


export class StrassenBaseCase extends BaseCase<StrassenInput, Matrix> {
    solve(): Matrix {
        const A = this.input().A.matrix
        const B = this.input().B.matrix
        return new Matrix([
            [new NumberValue(A[0][0].value * B[0][0].value + A[0][1].value * B[1][0].value), new NumberValue(A[0][0].value * B[0][1].value + A[0][1].value * B[1][1].value)],
            [new NumberValue(A[1][0].value * B[0][0].value + A[1][1].value * B[1][0].value), new NumberValue(A[1][0].value * B[0][1].value + A[1][1].value * B[1][1].value)]
        ])
    }

    dividedDetails(input: StrassenInput): CallDetails {
        return [{
            text: `The matrices are 2x2, so we can multiply them directly.`,
            valueKeyframes: [{
                "A": input.A,
                "B": input.B
            }]
        }]
    }

    solvedDetails(_: StrassenInput): CallDetails {
        return [{
            text: `The result is a 2x2 matrix.`,
            valueKeyframes: [{
                "C": this.solve()
            }]
        }]
    }
}


function add(A: NumberValue[][], B: NumberValue[][]): NumberValue[][] {
    return A.map((row, i) => row.map((val, j) => new NumberValue(val.value + B[i][j].value)))
}


function subtract(A: NumberValue[][], B: NumberValue[][]): NumberValue[][] {
    return A.map((row, i) => row.map((val, j) => new NumberValue(val.value - B[i][j].value)))
}
