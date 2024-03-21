// We define the state of a recursive call as one of the following:
// 1. Undivided: The call has not been divided into sub-calls.
// 2. Divided: The call has been divided into sub-calls, but the sub-calls have not been evaluated.
// 3. Solved: The call has been divided into sub-calls which have been evaluated and combined
//    to produce the solution.

export interface UndividedState {
	type: 'undivided';
}

export interface DividedState<In, Out> {
	type: 'divided';
	case: DivideCase<In, Out> | BaseCase<In, Out>;
}

export interface SolvedState<In, Out> {
	type: 'solved';
	case: DivideCase<In, Out> | BaseCase<In, Out>;
	result: Out;
}

export type RecursiveCallState<In, Out> =
	| UndividedState
	| DividedState<In, Out>
	| SolvedState<In, Out>;

export type RecursiveCalls<In, Out> = Record<string, RecursiveCall<In, Out>>;

// We define a way to configure an algorithm for use on the frontend.

export type InputType = 'Number' | 'NumberList' | 'Matrix' | 'Points';

export type IconType = 'Maths' | 'Sort' | 'Search' | 'Matrix' | 'Points' | 'Array' | 'Divide';

export interface AlgorithmConfig {
	name: string;
	icon: IconType;
	callConstructor: typeof RecursiveCall<unknown, unknown>;
	inputs: Record<string, InputType>;
}

// We define some types for working with details on the frontend. So each call detail can have multiple
// steps with values animated by keyframe.

export interface ValueKeyframe {
	type: InputType;
	value: unknown;
}

export interface CallDetailsStep {
	text: string;
	valueKeyframes?: Record<string, unknown>[];
	highlightedCalls?: string[];
}

export type CallDetails = CallDetailsStep[];

// An instance of RecursiveCall can be thought of as a node in a 'call tree'.
// This is conceptually different to a 'call stack' as we don't enforce an ordering
// on execution, allowing the user to explore the tree call by call.
//
// The main method of interest is 'case'. This method must return a RecursiveCase
// which represents the collection of sub-calls that must be made to solve the problem.
export abstract class RecursiveCall<In, Out> {
	_input: In;
	_state: RecursiveCallState<In, Out>;

	constructor(input: In) {
		this._input = input;
		this._state = { type: 'undivided' };
	}

	// Given the input to the call, return the appropriate RecursiveCase.
	abstract case(): DivideCase<In, Out> | BaseCase<In, Out>;

	// Return the details for the undivided state.
	abstract undividedDetails(): CallDetails;

	// Return the details for the call.
	details(): CallDetails {
		if (this._state.type === 'undivided') {
			return this.undividedDetails();
		} else {
			return this._state.case.details(this.input());
		}
	}

	// Compute the sub-calls that must be made to solve the problem.
	divide() {
		if (this._state.type === 'undivided') {
			this._state = {
				type: 'divided',
				case: this.case()
			};
		}
	}

	// Compute the solution by recursively calling 'result' on the sub-calls.
	conquer() {
		if (this._state.type !== 'solved') {
			this.divide();
			this._state = this._state as DividedState<In, Out>;
			this._state = {
				type: 'solved',
				result: this._state.case.result(),
				case: this._state.case
			};
		}
	}

	// Perform the next action to solving the call tree, traversing the calls
	// in order. Return the call acted on.
	step(): RecursiveCall<In, Out> | null {
		if (this._state.type === 'undivided') {
			this.divide();
			return this;
		} else if (this._state.type === 'divided') {
			for (const subcall of Object.values(this._state.case.calls())) {
				if (!subcall.isSolved()) {
					return subcall.step();
				}
			}
			// All subcalls solved
			this.conquer();
			return this;
		} else {
			return null;
		}
	}

	// Reverse the last action to solving the call tree, traversing the calls
	// in reverse order. Return the call acted on.
	back(): RecursiveCall<In, Out> | null {
		if (this._state.type === 'solved') {
			this.unsolve();
			return this;
		} else if (this._state.type === 'divided') {
			for (const subcall of Object.values(this._state.case.calls()).reverse()) {
				if (subcall.isDivided()) {
					return subcall.back();
				}
			}
			// All subcalls unsolved
			this._state = { type: 'undivided' };
			return this;
		} else {
			return null;
		}
	}

	// Return the last call to be acted on in the call tree as if we were solving it in order.
	lastActedUpon(): RecursiveCall<In, Out> | null {
		if (this._state.type === 'solved') {
			return this;
		} else if (this._state.type === 'divided') {
			for (const subcall of Object.values(this._state.case.calls()).reverse()) {
				if (subcall.isDivided()) {
					return subcall.lastActedUpon();
				}
			}
			// All subcalls unsolved
			return this;
		} else {
			return null;
		}
	}

	containsSubcall(call: RecursiveCall<In, Out>): boolean {
		if (this === call) {
			return true;
		} else if (this._state.type === 'divided') {
			return Object.values(this._state.case.calls()).some(
				(subcall) => subcall === call || subcall.containsSubcall(call)
			);
		} else {
			return false;
		}
	}

	// Unsolve the call, setting its state to 'divided'.
	unsolve() {
		if (this._state.type === 'solved') {
			this._state = {
				type: 'divided',
				case: this._state.case
			};
			this._state.case._result = null;
		}
	}

	// Return the solution to the problem by recursively calling 'result' on the sub-calls.
	result(): Out {
		if (this._state.type !== 'solved') {
			this.conquer();
		}
		this._state = this._state as SolvedState<In, Out>;
		return <Out>this._state.result;
	}

	// Reset the call to its initial state.
	reset() {
		this._state = { type: 'undivided' };
	}

	// Get the input to the call.
	input(): In {
		return this._input;
	}

	// Return true if the call has been divided into sub-calls.
	isDivided(): boolean {
		return this._state.type === 'divided' || this._state.type === 'solved';
	}

	// Return true if the call has been divided into sub-calls and the sub-calls have been evaluated.
	isCombinable(): boolean {
		return this._state.type === 'divided' && this._state.case.isCombinable();
	}

	// Return true if the call has been evaluated.
	isSolved(): boolean {
		return this._state.type === 'solved';
	}

	// Return true if the call has been evaluated and is a base case.
	isBaseCase(): boolean {
		return this._state.type !== 'undivided' && this._state.case instanceof BaseCase;
	}
}

export abstract class RecursiveCase<In, Out> {
	_result: Out | null = null;

	// Return the solution to the case.
	abstract result(): Out;

	// Return the sub-calls that must be made to solve the problem.
	abstract calls(): RecursiveCalls<In, Out>;

	// Return true if all sub-calls are solved.
	abstract isCombinable(): boolean;

	// Return the details for the divided state.
	abstract dividedDetails(input: In): CallDetails;

	// Return the details for the solved state.
	abstract solvedDetails(input: In): CallDetails;

	// Return true if the case has been evaluated.
	isSolved(): boolean {
		return this._result !== null;
	}

	// Return the details for the case.
	details(input: In): CallDetails {
		if (this.isSolved()) {
			return this.solvedDetails(input);
		} else {
			return this.dividedDetails(input);
		}
	}
}

export abstract class DivideCase<In, Out> extends RecursiveCase<In, Out> {
	_input: In;
	_subcalls: RecursiveCalls<In, Out>;

	constructor(input: In, subcalls: RecursiveCalls<In, Out>) {
		super();
		this._input = input;
		this._subcalls = subcalls;
	}

	// Combine the results of the sub-calls to solve the problem.
	abstract combine(): Out;

	// Return the solution to the case by calling 'result' on each of the sub-calls
	// and combining the results appropriately.
	result(): Out {
		if (this._result === null) {
			this._result = this.combine();
		}
		return this._result;
	}

	// Return the input to the case.
	input(): In {
		return this._input;
	}

	// Return the sub-calls that must be made to solve the problem.
	calls(): RecursiveCalls<In, Out> {
		return this._subcalls;
	}

	// Return true if all subcalls are solved.
	isCombinable(): boolean {
		return Object.values(this.calls()).every((call) => call.isSolved());
	}

	// Return the sub-calls that must be made to solve the problem along with the
	// side of the call tree on which they should be placed assuming each node has
	// constant width.
	calls_and_positions(): Record<
		string,
		{ call: RecursiveCall<In, Out>; position: 'left' | 'middle' | 'right' }
	> {
		const calls_and_positions: Record<
			string,
			{
				call: RecursiveCall<In, Out>;
				position: 'left' | 'middle' | 'right';
			}
		> = {};
		const calls = Object.entries(this.calls());
		// The first entry is on the left, the last entry is on the right, and the rest are in the middle.
		for (let i = 0; i < calls.length; i++) {
			const [name, call] = calls[i];
			if (i === 0) {
				calls_and_positions[name] = { call, position: 'left' };
			} else if (i === calls.length - 1) {
				calls_and_positions[name] = { call, position: 'right' };
			} else {
				calls_and_positions[name] = { call, position: 'middle' };
			}
		}
		return calls_and_positions;
	}
}

export abstract class BaseCase<In, Out> extends RecursiveCase<In, Out> {
	_input: In;
	_result: Out | null = null;

	constructor(input: In) {
		super();
		this._input = input;
	}

	abstract solve(): Out;

	result(): Out {
		if (this._result === null) {
			this._result = this.solve();
		}
		return this._result;
	}

	calls(): RecursiveCalls<In, Out> {
		return {};
	}

	input(): In {
		return this._input;
	}

	isCombinable(): boolean {
		return true;
	}
}
