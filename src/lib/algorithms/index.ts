import { FibonacciCall } from '$lib/algorithms/fibonacci';
import { MergeSortCall } from '$lib/algorithms/merge_sort';
import { BinarySearchCall } from '$lib/algorithms/binary_search';
import { QuickSortCall } from '$lib/algorithms/quick_sort';
import { KaratsubaCall } from '$lib/algorithms/karatsuba';
import { ClosestPointsCall } from '$lib/algorithms/closest_points';
import { StrassenCall } from '$lib/algorithms/strassen';
import { CofactorExpansionCall } from '$lib/algorithms/cofactor';
import { MaximalSubarrayCall } from '$lib/algorithms/maximum_subarray';
import type { AlgorithmConfig } from '$lib/core/recursive_call';

export type { InputType, AlgorithmConfig } from '$lib/core/recursive_call';

export const ALGORITHMS: AlgorithmConfig[] = [
	{
		name: 'Merge Sort',
		icon: 'Sort',
		callConstructor: MergeSortCall,
		inputs: {
			array: 'NumberList'
		}
	},
	{
		name: 'Quick Sort',
		icon: 'Sort',
		callConstructor: QuickSortCall,
		inputs: {
			array: 'NumberList'
		}
	},
	{
		name: 'Closest Pair of Points',
		icon: 'Points',
		callConstructor: ClosestPointsCall,
		inputs: {
			points: 'Points'
		}
	},
	{
		name: 'Maximal Subarray',
		icon: 'Array',
		callConstructor: MaximalSubarrayCall,
		inputs: {
			array: 'NumberList'
		}
	},
	{
		name: 'Fibonacci',
		icon: 'Maths',
		callConstructor: FibonacciCall,
		inputs: {
			n: 'Number'
		}
	},
	{
		name: "Karatsuba's Algorithm",
		icon: 'Maths',
		callConstructor: KaratsubaCall,
		inputs: {
			x: 'Number',
			y: 'Number'
		}
	},
	{
		name: 'Binary Search',
		icon: 'Search',
		callConstructor: BinarySearchCall,
		inputs: {
			array: 'NumberList',
			target: 'Number'
		}
	},
	{
		name: "Strassen's Algorithm",
		icon: 'Matrix',
		callConstructor: StrassenCall,
		inputs: {
			A: 'Matrix',
			B: 'Matrix'
		}
	},
	{
		name: 'Cofactor Expansion',
		icon: 'Matrix',
		callConstructor: CofactorExpansionCall,
		inputs: {
			matrix: 'Matrix'
		}
	}
];
