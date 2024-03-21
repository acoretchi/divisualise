<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { AlgorithmConfig } from "$lib/algorithms";
    import NumberInput from "$lib/components/input/NumberInput.svelte";
    import NumberListInput from "$lib/components/input/NumberListInput.svelte";
    import MatrixInput from "$lib/components/input/MatrixInput.svelte";
    import PointsInput from "$lib/components/input/PointsInput.svelte";
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let algorithm: AlgorithmConfig;
    export let error: string | null = null;

    const dispatch = createEventDispatcher();

    let values: Record<string, any> = {};

    function submit() {
        dispatch("submit", { values });
    }
</script>

<div class="flex flex-col" in:fly={{ y: 20, duration: 500, easing: quintOut }}>
    <h1 class="text-2xl md:text-4xl font-bold mb-2 md:mb-4">{algorithm.name}</h1>
    <form on:submit|preventDefault={submit} class="w-full">
        {#each Object.entries(algorithm.inputs) as [input, type]}
            <div class="border-t-4 border-black" />
            <div class="mt-2 md:mt-4">
                <h2 class="text-xl md:text-3xl font-bold capitalize md:my-2">{input}</h2>
                {#if type === "Number"}
                    <NumberInput bind:value={values[input]} />
                {:else if type === "NumberList"}
                    <NumberListInput bind:value={values[input]} />
                {:else if type === "Matrix"}
                    <MatrixInput bind:value={values[input]} />
                {:else if type === "Points"}
                    <PointsInput bind:value={values[input]} />
                {/if}
            </div>
        {/each}
        <div class="border-t-4 border-black my-2 md:my-4" />
        {#if error !== null}
            <p class="text-red-500 font-bold text-md md:text-xl">{error}</p>
        {/if}
        <button 
            class="text-lg md:text-2xl w-full text-white font-extrabold bg-blue-400 p-2 md:p-4 my-2 rounded-xl cursor-pointer transition duration-200 ease-out flex items-center drop-shadow-md hover:drop-shadow-2xl border-4 border-black hover:scale-105 active:scale-95"
        >
            <span class="mx-auto">Submit</span>
        </button>
    </form>
</div>
