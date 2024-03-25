import { RecursiveCall, RecursiveCase, DivideCase, BaseCase } from "$lib/core/recursive_call"
import type { CallDetails, RecursiveCalls } from "$lib/core/recursive_call"
import { Matrix, NumberValue } from "$lib/core/values"


export interface CofactorExpansionInput {
    matrix: Matrix
}


export class CofactorExpansionCall extends RecursiveCall<CofactorExpansionInput, NumberValue> {

    constructor(input: CofactorExpansionInput, root: CofactorExpansionCall | null = null) {
        if (input.matrix.matrix.length !== input.matrix.matrix[0].length) {
            throw new Error("The matrix must be square.")
        }
        if (input.matrix.matrix.length < 2) {
            throw new Error("The matrix must be at least 2x2.")
        }
        super(input, root)
    }

    case(root: CofactorExpansionCall): RecursiveCase<CofactorExpansionInput, NumberValue> {
        const matrix = this.input().matrix.copy()
        if (matrix.matrix.length === 2) {
            return new CofactorExpansionBaseCase(this.input())
        } else {
            return new CofactorExpansionDivideCase(this.input(), root)
        }
    }

    undividedDetails(): CallDetails {
        return [{
            text: "We want to calculate the determinant of the matrix using the cofactor expansion method.",
            valueKeyframes: [{
                "Matrix": this.input().matrix
            }]
        }]
    }

}

export class CofactorExpansionDivideCase extends DivideCase<CofactorExpansionInput, NumberValue> {

    divide(input: CofactorExpansionInput, root: CofactorExpansionCall): RecursiveCalls<CofactorExpansionInput, NumberValue> {
        return generateCofactorCalls(input.matrix, root)
    }

    combine(): NumberValue {
        let determinant = new NumberValue(0)
        let sign = 1
        for (let i = 0; i < this.input().matrix.matrix.length; i++) {
            const cofactorValue = this.calls()[`Cofactor ${i+1}`].result()
            const term = new NumberValue(sign * this.input().matrix.matrix[0][i].value * cofactorValue.value)
            determinant = new NumberValue(determinant.value + term.value)
            sign *= -1
        }
        return determinant
    }

    dividedDetails(input: CofactorExpansionInput): CallDetails {
        const matrix = input.matrix.copy()
        const details: CallDetails = []

        for (let i = 0; i < matrix.matrix.length; i++) {
            const cofactor = getCofactor(matrix, 0, i)
            const element = matrix.matrix[0][i].copy()
            const elementColor = i % 2 === 0 ? "green" : "yellow"
            const cofactorColor = i % 2 === 0 ? "blue" : "red"

            const matrixWithColoredElements = matrix.copy()
            matrixWithColoredElements.matrix[0][i] = element.coloured(elementColor)
            for (let j = 0; j < cofactor.matrix.length; j++) {
                for (let k = 0; k < cofactor.matrix[j].length; k++) {
                    matrixWithColoredElements.matrix[j + 1][k < i ? k : k + 1] = cofactor.matrix[j][k].coloured(cofactorColor)
                }
            }

            const keyframe = {
                "Matrix": matrixWithColoredElements,
                "Element": element.coloured(elementColor),
                [`Cofactor ${i+1}`]: cofactor
            }

            details.push({
                text: `We expand along the first row of the matrix, recursing on the cofactors of each element.`,
                valueKeyframes: [keyframe]
            })
        }

        return details
    }

    solvedDetails(input: CofactorExpansionInput): CallDetails {
        const matrix = input.matrix.copy()
        const determinant = this.result()
        const details: CallDetails = []
        let sign = 1
        let runningTotal = new NumberValue(0)

        for (let i = 0; i < matrix.matrix.length; i++) {
            const cofactor = getCofactor(matrix, 0, i)
            const cofactorValue = this.calls()[`Cofactor ${i+1}`].result()
            const element = matrix.matrix[0][i].copy()
            const elementColor = i % 2 === 0 ? "green" : "yellow"
            const cofactorColor = i % 2 === 0 ? "blue" : "red"
            const term = new NumberValue(sign * element.value * cofactorValue.value)

            const matrixWithColoredElements = matrix.copy()
            matrixWithColoredElements.matrix[0][i] = element.coloured(elementColor)
            for (let j = 0; j < cofactor.matrix.length; j++) {
                for (let k = 0; k < cofactor.matrix[j].length; k++) {
                    matrixWithColoredElements.matrix[j + 1][k < i ? k : k + 1] = cofactor.matrix[j][k].coloured(cofactorColor)
                }
            }

            details.push(
                {
                    text: `We multiply ${element.value} by its cofactor determinant.`,
                    valueKeyframes: [{
                        "Matrix": matrixWithColoredElements,
                        "Element": element.coloured(elementColor),
                        [`Cofactor ${i+1}`]: cofactor
                    }]
                },
                {
                    text: `The result is ${term.value}.`,
                    valueKeyframes: [{
                        "Matrix": matrixWithColoredElements,
                        "Term": term,
                        "Element": element.coloured(elementColor),
                        [`Cofactor ${i+1}`]: cofactor,
                    }]
                },
                {
                    text: sign === 1 ? `We add this term to the determinant.` : `We subtract this term from the determinant.`,
                    valueKeyframes: [{
                        "Running total": runningTotal = new NumberValue(runningTotal.value + term.value),
                        "Term": term,
                    }]
                }
            )

            sign *= -1
        }

        details.push(
            {
                text: `After collecting all the terms, we return ${determinant.value} as the determinant of the matrix.`,
                valueKeyframes: [{
                    "Determinant": determinant,
                    "Matrix": matrix,
                }]
            }
        )

        return details
    }

}


export class CofactorExpansionBaseCase extends BaseCase<CofactorExpansionInput, NumberValue> {

    solve(): NumberValue {
        const [[a, b], [c, d]] = this.input().matrix.matrix
        return new NumberValue(a.value * d.value - b.value * c.value)
    }

    dividedDetails(input: CofactorExpansionInput): CallDetails {
        return [{
            text: "The matrix is 2x2, this is our base case.",
            valueKeyframes: [{
                "Matrix": input.matrix
            }]
        }]
    }

    solvedDetails(input: CofactorExpansionInput): CallDetails {
        return [{
            text: "We calculate the determinant of the 2x2 matrix directly.",
            valueKeyframes: [{
                "Determinant": this.solve(),
                "Matrix": input.matrix,
            }]
        }]
    }

}


function generateCofactorCalls(matrix: Matrix, root: CofactorExpansionCall): { [key: string]: CofactorExpansionCall } {
    const cofactorCalls: { [key: string]: CofactorExpansionCall } = {}
    for (let i = 0; i < matrix.matrix.length; i++) {
        cofactorCalls[`Cofactor ${i+1}`] = new CofactorExpansionCall({
            matrix: getCofactor(matrix, 0, i)
        }, root)
    }
    return cofactorCalls
}

function getCofactor(matrix: Matrix, row: number, col: number): Matrix {
    const cofactor: NumberValue[][] = []
    for (let i = 0; i < matrix.matrix.length; i++) {
        if (i === row) continue
        const cofactorRow: NumberValue[] = []
        for (let j = 0; j < matrix.matrix[i].length; j++) {
            if (j === col) continue
            cofactorRow.push(matrix.matrix[i][j].copy())
        }
        cofactor.push(cofactorRow)
    }
    return new Matrix(cofactor)
}
