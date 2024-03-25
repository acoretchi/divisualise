import { NumberValue, NumberList, Matrix, Points } from "$lib/core/values"

////////////////////////////////////////////////////////////////////////////////////////////////////
// We define some types for working with the input and output of recursive calls.
////////////////////////////////////////////////////////////////////////////////////////////////////

export type IOValue = NumberValue | NumberList | Matrix | Points

export type IOValueObject<T> = {
    [K in keyof T]: T[K] extends IOValue ? T[K] : never;
};

export type NamedIOValues = Record<string, IOValue>

function copyValueOrObject<T extends IOValueObject<T>>(value: IOValue | T): IOValue | T {
    if (
        value instanceof NumberValue 
        || value instanceof NumberList 
        || value instanceof Matrix 
        || value instanceof Points
    ) {
        return value.copy()
    }
    else {
        const copy: Partial<T> = {}
        for (const key in value) {
            // @ts-ignore
            copy[key] = value[key].copy()
        }
        return copy as T
    }
}

function equalsValueOrObject<T extends IOValue | IOValueObject<T>>(a: T, b: T): boolean {
    if (
        a instanceof NumberValue
            || a instanceof NumberList
            || a instanceof Matrix
            || a instanceof Points
    ) {
        // @ts-ignore
        return a.equals(b);
    }
    else {
        for (const key in a) {
            // @ts-ignore
            if (!a[key].equals(b[key])) {
                return false
            }
        }
        return true
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// We define the state of a recursive call as one of the following:
// 1. Undivided: The call has not been divided into sub-calls.
// 2. Divided: The call has been divided into sub-calls, but the sub-calls have not been evaluated.
// 3. Solved: The call has been divided into sub-calls which have been evaluated and combined
//    to produce the solution.
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface UndividedState {
    type: "undivided"
    memoisedPath: string[] | null
}

export interface DividedState<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    type: "divided"
    case: RecursiveCase<In, Out>
}

export interface SolvedState<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    type: "solved"
    case: RecursiveCase<In, Out>
    result: Out
}

// An undivided state transitions directly to a memoised state if the call is memoised.
export interface MemoisedState<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    type: "memoised"
    memoisedPath: string[]
    result: Out
}

export type RecursiveCallState<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>>
= UndividedState | DividedState<In, Out> | SolvedState<In, Out> | MemoisedState<In, Out>

export type RecursiveCalls<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> = Record<string, RecursiveCall<In, Out>>


////////////////////////////////////////////////////////////////////////////////////////////////////
// We define a way to configure an algorithm for use on the frontend.
////////////////////////////////////////////////////////////////////////////////////////////////////

export type InputType = "Number" | "NumberList" | "Matrix" | "Points"

export type IconType = "Maths" | "Sort" | "Search" | "Matrix" | "Points" | "Array" | "Divide"

export interface AlgorithmConfig<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    name: string
    icon: IconType
    callConstructor: typeof RecursiveCall<In, Out>
    inputs: Record<string, InputType>
}


////////////////////////////////////////////////////////////////////////////////////////////////////
// We define some types for working with details on the frontend. So each call detail can have
// multiple steps with values animated by keyframe.
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface CallDetailsStep<T extends IOValueObject<T>> {
    text: string
    valueKeyframes?: Record<string, IOValue | IOValueObject<T>>[]
    highlightedCalls?: string[]
}

export type CallDetails = CallDetailsStep<any>[]


////////////////////////////////////////////////////////////////////////////////////////////////////
// An instance of RecursiveCall can be thought of as a node in a 'call tree'.
//
// For a call that is not memoised, we do not enforce an ordering on the sub-calls to allow them to
// be traversed in any order by the user. However, we enforce an ordering on memoised calls to ensure
// that a call that would be memoised cannot be exploed until the call it relies on is solved.
////////////////////////////////////////////////////////////////////////////////////////////////////

interface MemoisedResult<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    input: IOValueObject<In>
    result: Out
    firstSolvedPath: string[]
}

export abstract class RecursiveCall<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    _input: In
    _state: RecursiveCallState<In, Out>
    root: RecursiveCall<In, Out>
    memoisedResults: MemoisedResult<In, Out>[] = []
    memoise: boolean = false

    constructor (input: In, root: RecursiveCall<In, Out> | null = null) {
        this._input = input
        this._state = {type: "undivided", memoisedPath: null}
        this.root = root !== null ? root : this

        // If this is the root element, we want to traverse the tree ahead of time
        // to find the first solved path for each input.
        if (this.isRoot() && this.isMemoisable()) {
            // @ts-ignore
            const shadowCall = new this.constructor(copyValueOrObject(input), this)
            shadowCall.root = shadowCall
            shadowCall.memoise = true
            while (!shadowCall.isSolved()) {
                const traversed = shadowCall.step()
                if (traversed.isStrictlySolved()) {
                    shadowCall.memoisedResults.push({
                        input: copyValueOrObject(traversed.input()),
                        result: copyValueOrObject(traversed.result()),
                        firstSolvedPath: shadowCall.pathOf(traversed) as string[]
                    })
                }
            }
            this.memoisedResults = shadowCall.memoisedResults
        }
    }

    // Given the input to the call, return the appropriate RecursiveCase.
    abstract case(root: RecursiveCall<In, Out>): RecursiveCase<In, Out>


    // Return the details for the undivided state.
    abstract undividedDetails(): CallDetails

    // Implementors must override this method to return true if the call is memoisable.
    isMemoisable(): boolean {
        return false
    }

    toggleMemoise() {
        if (!this.isRoot()) { return }
        this.memoise = !this.memoise
        if (!this.memoise) {
            // When we turn memoisation off, we find all memoised calls and unsolve then conquer
            // them to fully solve their subcalls.
            for (const call of this.allTreeCalls()) {
                if (call.isMemoised()) {
                    call.unsolve()
                    call.conquer()
                }
            }
        } 
        else {
            // When we turn memoisation on, we reset all calls that depend on unsolved memoised
            // calls.
            for (const call of this.allTreeCalls().reverse()) {
                // The call has been removed from the tree in a previous step.
                if (call.pathFromRoot() === null) {
                    continue
                }
                const mem = this.memoisedResults.find(
                    mem => equalsValueOrObject(mem.input, call.input())
                )
                // We need to handle memoised results carefully.
                if (mem !== undefined) {
                    if (call._state.type === "undivided") {
                        call._state.memoisedPath = mem.firstSolvedPath
                    }
                    else if (
                        call._state.type === "divided"
                    ) {
                        if (
                            call.pathFromRoot().join(",") !== mem.firstSolvedPath.join(",")
                        ) {
                            call._state = {
                                type: "undivided",
                                memoisedPath: mem.firstSolvedPath
                            }
                        } 
                        else if (call.isCombinable()) {
                            call._state = {
                                type: "memoised",
                                memoisedPath: mem.firstSolvedPath,
                                result: mem.result
                            }                        
                        }
                        
                    }
                    else if (
                        call._state.type === "solved"
                        && call.pathFromRoot().join(",") !== mem.firstSolvedPath.join(",")
                    ) {
                        if (!this.callFromRoot(mem.firstSolvedPath)?.isSolved()) {
                            call._state = {
                                type: "undivided",
                                memoisedPath: mem.firstSolvedPath
                            }
                        }
                        else {
                            call._state = {
                                type: "memoised",
                                memoisedPath: mem.firstSolvedPath,
                                result: mem.result
                            }
                        }
                    }
                }
            }
        }
    }

    memoisedDetails(): CallDetails {
        return [{
            text: "We return the memoised result.",
            valueKeyframes: [{
                "Result": this.result()
            }]
        }]
    }

    // Return the details for the call.
    details(): CallDetails {
        if (this._state.type === "undivided") {
            if (this._state.memoisedPath !== null && this.isRootMemoised()) {
                if (this.isDivisible()) {
                    return [{
                        text: "This call depends on a subproblem that we solved earlier in the tree.",
                        valueKeyframes: [{
                            "Input": copyValueOrObject(this.input())
                        }],
                    }]
                }
                else {
                    return [{
                        text: "This call depends on a subproblem that we solve earlier in the tree; it cannot be evaluated until that subproblem is solved.",
                        valueKeyframes: [{
                            "Input": copyValueOrObject(this.input())
                        }]
                    }]
                }
            }
            else {
                return this.undividedDetails()
            }
        }
        else if (this._state.type === "memoised") {
            return this.memoisedDetails()
        }
        else {
            return this._state.case.details(this.input())
        }
    }


    allSubcalls(): RecursiveCall<In, Out>[] {
        if (this._state.type === "undivided" || this._state.type === "memoised") {
            return []
        } else {
            const subcalls: RecursiveCall<In, Out>[] = []
            for (const subcall of Object.values(this._state.case.calls())) {
                subcalls.push(subcall)
                subcalls.push(...subcall.allSubcalls())
            }
            return subcalls
        }
    }

    allTreeCalls(): RecursiveCall<In, Out>[] {
        return this.root.allSubcalls()
    }

    allSubcallPaths(prefix: string[] | null = null): string[][] {
        if (this._state.type === "undivided" || this._state.type === "memoised") {
            return []
        } else {
            if (prefix === null) {
                prefix = this.pathFromRoot()
            }
            const paths: string[][] = []
            for (const [name, subcall] of Object.entries(this._state.case.calls())) {
                paths.push([...prefix, name])
                paths.push(...subcall.allSubcallPaths([...prefix, name]))
            }
            return paths
        }
    }

    pathFromRoot(): string[] {
        return this.root.pathOf(this) as string[]
    }

    isRoot(): boolean {
        return this.root === this
    }

    isRootMemoised(): boolean {
        return this.root.memoise
    }

    getMemoisedResults(): MemoisedResult<In, Out>[] {
        return this.root.memoisedResults
    }

    // Return the path to the call in the call tree.
    pathOf(call: RecursiveCall<In, Out>): string[] | null {
        if (this === call) {
            return []
        }
        else if (this._state.type === "divided" || this._state.type === "solved") {
            for (const [name, subcall] of Object.entries(this._state.case.calls())) {
                if (subcall === call) {
                    return [name]
                }
                else {
                    const subpath = subcall.pathOf(call)
                    if (subpath !== null) {
                        return [name, ...subpath]
                    }
                }
            }
        }
        return null
    }

    callAt(path: string[]): RecursiveCall<In, Out> | null {
        if (path.length === 0) {
            return this
        }
        else if (this._state.type === "divided" || this._state.type === "solved") {
            const subcall = this._state.case.calls()[path[0]]
            if (subcall !== undefined) {
                return subcall.callAt(path.slice(1))
            }
        }
        return null
    }

    callFromRoot(path: string[]): RecursiveCall<In, Out> | null {
        return this.root.callAt(path)
    }

    // Compute the sub-calls that must be made to solve the problem.
    divide() {
        if (this.isDivisible()) {
            const memoised = this.getMemoisedResults()
                .find(mem => equalsValueOrObject(mem.input, this._input))
            if (
                this.isRootMemoised()
                && memoised !== undefined
                && this.pathFromRoot().join(",") !== memoised.firstSolvedPath.join(",")
            ) {
                this._state = {
                    type: "memoised",
                    memoisedPath: memoised.firstSolvedPath,
                    result: memoised.result
                }
            }
            else {
                // We ensure that every node in the tree tracks the first solved paths.
                const nextCase = this.case(this.root)
                this._state = {
                    type: "divided",
                    case: nextCase
                }
            }
        }
    }

    combine() {
        if (this.isCombinable() && this._state.type === "divided") {
            this._state = {
                type: "solved",
                result: this._state.case.result(),
                case: this._state.case
            }
        }
    }

    // Compute the solution by stepping through the call tree in order.
    conquer() {
        while (!this.isSolved()) {
            this.step()
        }
    }

    // Perform the next action to solving the call tree, traversing the calls
    // in order. Return the call acted on.
    step(): RecursiveCall<In, Out> | null {
        if (this.isDivisible()) {
            this.divide()
            return this
        }
        else if (this._state.type === "divided") {
            for (const subcall of Object.values(this._state.case.calls())) {
                if (!subcall.isSolved()) {
                    return subcall.step()
                }
            }
            this.combine()
            return this
        }
        else {
            return null
        }
    }

    // Reverse the last action to solving the call tree, traversing the calls
    // in reverse order. Return the call acted on.
    back(): RecursiveCall<In, Out> | null {
        if (this.isSolved()) {
            this.unsolve()
            return this
        }
        else if (this._state.type === "divided") {
            for (const subcall of Object.values(this._state.case.calls()).reverse()) {
                if (subcall.isDivided() || subcall.isMemoised()) {
                    return subcall.back()
                }
            }
            // All subcalls unsolved
            this._state = {type: "undivided", memoisedPath: null}
            return this
        }
        else {
            return null
        }
    }


    // Return the next call to be acted on in the call tree.
    next(): RecursiveCall<In, Out> | null {
        if (this.isDivisible()) {
            return this
        }
        else if (this._state.type === "divided") {
            for (const subcall of Object.values(this._state.case.calls())) {
                if (!subcall.isSolved()) {
                    return subcall.next()
                }
            }
            return this
        }
        else {
            return null
        }
    }

    // Return the next call to be reversed in the call tree by traversing the calls in reverse order.
    previous(): RecursiveCall<In, Out> | null {
        if (this.isSolved()) {
            return this
        }
        else if (this._state.type === "divided") {
            for (const subcall of Object.values(this._state.case.calls()).reverse()) {
                if (subcall.isDivided() || subcall.isMemoised()) {
                    return subcall.previous()
                }
            }
            return this
        }
        else {
            return null
        }
    }

    // Unsolve the call, setting its state to 'divided'.
    unsolve() {
        if (this._state.type === "solved") {
            this._state = {
                type: "divided",
                case: this._state.case
            }
            this._state.case._result = null
        } else if (this._state.type === "memoised") {
            this._state = {type: "undivided", memoisedPath: this._state.memoisedPath}
        }
    }

    // Return the solution to the problem by recursively calling 'result' on the sub-calls.
    result(): Out {
        if (this._state.type !== "solved") {
            if (this._state.type === "memoised") {
                return this._state.result
            }
            else {
                this.conquer()
            }
        }
        this._state = this._state as SolvedState<In, Out>
        return <Out> this._state.result
    }

    // Reset the call to its initial state.
    reset() {
        // Unsolve all the solved calls on the path to this call. Keeping track of the affected
        // paths.
        const path = this.pathFromRoot()!
        const affectedPaths = [[...path]]
        path.pop()
        for (let i = path.length; i >= 0; i--) {
            const call = this.callFromRoot(path)!
            if (call.isSolved()) {
                call.unsolve()
                affectedPaths.push([...path])
                path.pop()
            } else {
                break
            }
        }            
        // If we're in a memoised call tree, we need to reset all evaluated memoised calls that
        // depend on any of the calls we've just unsolved or any subcalls of this call.
        if (this.isRootMemoised()) {
            affectedPaths.push(...this.allSubcallPaths())
            for (const otherCall of this.allTreeCalls().reverse()) {
                if (
                    otherCall.memoisedPath() !== null
                    && affectedPaths.some(
                        path => path.join(",") === otherCall.memoisedPath()!.join(",")
                    )
                ) {
                    otherCall.reset()
                }
                // We can't affect any calls that come before this call in the tree.
                if (otherCall === this) {
                    break
                }
            }            
        }
        // Reset this call
        if (this._state.type === "divided" || this._state.type === "solved") {
            this._state = {type: "undivided", memoisedPath: null}
        } else {
            this._state = {type: "undivided", memoisedPath: this._state.memoisedPath}
        }
    }

    // Get the input to the call.
    input(): In {
        return copyValueOrObject(this._input) as In
    }

    // Return true if we can divide the call
    isDivisible(): boolean {
        return (
            this._state.type === "undivided" 
            && (
                !this.isRootMemoised()
                || this._state.memoisedPath === null
                || this._state.memoisedPath.join(",") === this.pathFromRoot()?.join(",")
                || this.memoisedCallIsSolved()
            )
        )
    }
    
    // Return true if the call has been divided into sub-calls or evaluated.
    isDivided(): boolean {
        return (
            this._state.type === "divided" 
            || this._state.type === "solved" 
            || this._state.type === "memoised"
        )
    }

    // Return true if the call has been divided into sub-calls and the sub-calls have been evaluated.
    isCombinable(): boolean {
        return this._state.type === "divided" && this._state.case.isCombinable()
    }

    // Return true if the call has been evaluated.
    isSolved(): boolean {
        return this._state.type === "solved" || this._state.type === "memoised"
    }

    // Return true if the call has been evaluated but is not memoised.
    isStrictlySolved(): boolean {
        return this._state.type === "solved"
    }

    // Return true if the call has been evaluated and is memoised.
    isMemoised(): boolean {
        return this._state.type === "memoised"
    }

    // Return the path to this call's memoised call if it exists.
    memoisedPath(): string[] | null {
        if (this._state.type === "memoised" || this._state.type === "undivided") {
            return this._state.memoisedPath
        }
        return null
    }

    // Return the memoised call if it exists i.e. the call has already been introduced to the tree.
    memoisedCall(): RecursiveCall<In, Out> | null {
        const memoisedPath = this.memoisedPath()
        if (memoisedPath !== null) {
            return this.callFromRoot(memoisedPath)
        }
        return null
    }

    // Return true if this calls memoised call exists and is solved.
    memoisedCallIsSolved(): boolean {
        const memoisedCall = this.memoisedCall()
        return memoisedCall !== null && memoisedCall.isSolved()
    }

    // Return true if the call has been evaluated and is a base case.
    isBaseCase(): boolean {
        return (
            this._state.type !== "undivided" 
            && this._state.type !== "memoised"
            && this._state.case instanceof BaseCase
        )
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////
// We define two types of recursive cases:
// 1. DivideCase: A case that must be divided into sub-calls to solve the problem.
// 2. BaseCase: A case that is a base case and can be solved directly.
////////////////////////////////////////////////////////////////////////////////////////////////////

export abstract class RecursiveCase<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> {
    _result: Out | null = null

    // Return the solution to the case.
    abstract result(): Out

    // Return the sub-calls that must be made to solve the problem.
    abstract calls(): RecursiveCalls<In, Out>

    // Return true if all sub-calls are solved.
    abstract isCombinable(): boolean

    // Return the details for the divided state.
    abstract dividedDetails(input: In): CallDetails

    // Return the details for the solved state.
    abstract solvedDetails(input: In): CallDetails

    // Return true if the case has been evaluated.
    isSolved(): boolean {
        return this._result !== null
    }

    // Return the details for the case.
    details(input: In): CallDetails {
        if (this.isSolved()) {
            return this.solvedDetails(input)
        }
        else {
            return this.dividedDetails(input)
        }
    }

}


export abstract class DivideCase<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> extends RecursiveCase<In, Out> {
    _input: In
    _subcalls: RecursiveCalls<In, Out>

    constructor (input: In, root: RecursiveCall<In, Out>) {
        super()
        this._input = input
        this._subcalls = this.divide(input, root)
        for (const call of Object.values(this._subcalls)) {
            const state = call._state as UndividedState
            state.memoisedPath = root.memoisedResults.find(
                mem => equalsValueOrObject(mem.input, call.input())
            )?.firstSolvedPath ?? null
        }
    }

    // Divide the case into sub-calls.
    abstract divide(input: In, root: RecursiveCall<In, Out>): RecursiveCalls<In, Out>

    // Combine the results of the sub-calls to solve the problem.
    abstract combine(): Out

    // Return the solution to the case by calling 'result' on each of the sub-calls
    // and combining the results appropriately.
    result(): Out {
        if (this._result === null) {
            this._result = this.combine()
        }
        return this._result
    }

    // Return the input to the case.
    input(): In {
        return this._input
    }

    // Return the sub-calls that must be made to solve the problem.
    calls(): RecursiveCalls<In, Out> {
        return this._subcalls
    }

    // Return true if all subcalls are solved.
    isCombinable(): boolean {
        return Object.values(this.calls()).every(call => call.isSolved())
    }

    // Return the sub-calls that must be made to solve the problem along with the
    // side of the call tree on which they should be placed assuming each node has
    // constant width.
    calls_and_positions(): Record<string, { call: RecursiveCall<In, Out>, position: "left" | "middle" | "right"  }> {
        const calls_and_positions: Record<string, { 
            call: RecursiveCall<In, Out>, position: "left" | "middle" | "right" 
        }> = {}
        const calls = Object.entries(this.calls())
        // The first entry is on the left, the last entry is on the right, and the rest are in the middle.
        for (let i = 0; i < calls.length; i++) {
            const [name, call] = calls[i]
            if (i === 0) {
                calls_and_positions[name] = {call, position: "left"}
            }
            else if (i === calls.length - 1) {
                calls_and_positions[name] = {call, position: "right"}
            }
            else {
                calls_and_positions[name] = {call, position: "middle"}
            }
        }
        return calls_and_positions
    }

}


export abstract class BaseCase<
    In extends IOValueObject<In>,
    Out extends IOValue | IOValueObject<Out>
> extends RecursiveCase<In, Out> {
    _input: In
    _result: Out | null = null

    constructor (input: In) {
        super()
        this._input = input
    }

    abstract solve(): Out

    result(): Out {
        if (this._result === null) {
            this._result = this.solve()
        }
        return this._result
    }

    calls(): RecursiveCalls<In, Out> {
        return {}
    }

    input(): In {
        return this._input
    }

    isCombinable(): boolean {
        return true
    }

}
