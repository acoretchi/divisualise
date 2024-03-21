<script lang="ts">
	import { NumberValue } from '$lib/core/values';
	import { NumberList } from '$lib/core/values';
	import { Points } from '$lib/core/values';
	import { Matrix } from '$lib/core/values';
	import NumberComponent from '$lib/components/values/Number.svelte';
	import NumberListComponent from '$lib/components/values/NumberList.svelte';
	import PointsComponent from '$lib/components/values/Points.svelte';
	import MatrixComponent from '$lib/components/values/Matrix.svelte';

	export let value: unknown;
	export let dividers: boolean = true;
	export let capitalise: boolean = true;
</script>

{#if value instanceof NumberValue}
	<NumberComponent {value} />
{:else if value instanceof NumberList}
	<NumberListComponent {value} />
{:else if value instanceof Points}
	<PointsComponent {value} />
{:else if value instanceof Matrix}
	<MatrixComponent {value} />
{:else if value && value.constructor === Object}
	{#each Object.entries(value) as [k, v]}
		<div>
			{#if dividers}
				<div class="w-full my-2 md:my-4 border-y-2 border-black" />
			{/if}
			<span class="font-semibold text-xl md:text-2xl my-2 md:my-4" class:capitalize={capitalise}
				>{k}:</span
			>
			<div class="h-2" />
			<svelte:self value={v} />
			<div class="h-6" />
		</div>
	{/each}
{:else}
	{value}
{/if}
