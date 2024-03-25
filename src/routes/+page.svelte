<script lang="ts">
    import "../app.css";
    import "@fontsource-variable/nunito"

    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    import { ALGORITHMS } from "$lib/algorithms";
    import Inputs from "$lib/components/input/Inputs.svelte";
    import Divisualise from "$lib/components/Divisualise.svelte";
    import type { RecursiveCall, IOValue, IOValueObject } from "$lib/core/recursive_call";
    import type { AlgorithmConfig } from "$lib/algorithms";

    import Icon from "svelte-icons-pack/Icon.svelte";
    import FaSolidSortAmountDown from "svelte-icons-pack/fa/FaSolidSortAmountDown";
    import FaSolidSearch from "svelte-icons-pack/fa/FaSolidSearch";
    import FaSolidDivide from "svelte-icons-pack/fa/FaSolidDivide";
    import BiSolidChess from "svelte-icons-pack/bi/BiSolidChess";
    import BiMath from "svelte-icons-pack/bi/BiMath";
    import CgToggleSquare from "svelte-icons-pack/cg/CgToggleSquare";
    import BiScatterChart from "svelte-icons-pack/bi/BiScatterChart";

    let selectedAlgorithm: AlgorithmConfig<IOValueObject<unknown>, IOValue> | null = null
    let input: unknown = null
    let inputError: string | null = null
    let call: RecursiveCall<IOValueObject<unknown>, IOValue> | null = null
    let iconWidth = 24


    function submitInput(e: CustomEvent) {
        input = e.detail.values
        if (selectedAlgorithm === null) return
        try {
            // @ts-ignore
            const baseCall = new selectedAlgorithm.callConstructor(input)
            call = baseCall
            inputError = null
        } catch (e) {
            if (e instanceof Error) {
                inputError = e.message
            } else {
                inputError = "An error occurred."
            }
            input = null
        }
    }

    function reset() {
        selectedAlgorithm = null
        input = null
        call = null
    }

</script>


{#if call === null}
    <div class="flex w-screen h-screen bg-gray-50 justify-center overflow-y-scroll">
        <div class="flex flex-col w-5/6 md:w-2/3 max-w-xl my-12 md:my-24 h-fit">
            <div class="relative flex mx-auto">
                <h1 class="text-5xl md:text-6xl font-bold mx-auto cursor-pointer" on:click={reset}>
                    Divisualise!
                </h1>
                <div class="text-xs md:text-md bg-blue-400 rounded-full absolute left-[98%] bottom-[60%] py-1 px-2 text-white font-bold">
                    Alpha!
                </div>
            </div>
            <div class="text-sm mx-auto text-gray-400 font-semibold mb-4 md:mb-8">
                By <a href="https://armandcoretchi.com" target="_blank" class="text-blue-400 underline">Armand Coretchi</a>.
            </div>
            <span class="text-md md:text-xl font-bold mx-auto mb-2 md:mb-6">
                Please complete the <a href="https://forms.gle/bthpuGJ6CdeES7q9A" target="_blank" class="text-blue-400 underline">user survey</a> after using Divisualise!
            </span>

            {#if selectedAlgorithm === null}
                <h2 class="text-xl md:text-2xl font-bold mx-auto mb-2 md:mb-6">
                    Please select an algorithm.
                </h2>

                {#each ALGORITHMS as algorithm, i}
                    <button
                        on:click={() => selectedAlgorithm = algorithm}
                        class="text-lg md:text-2xl font-bold bg-white p-2 md:p-4 my-1 md:my-2 cursor-pointer transition duration-200 ease-out flex items-center drop-shadow-md hover:drop-shadow-2xl border-4 border-black hover:outline hover:outline-4 hover:outline-blue-400 rounded-xl hover:scale-105 active:scale-95"
                        in:fly|local={{ y: 20, delay: i * 100, easing: quintOut }}
                    >
                        {#if algorithm.icon === "Sort"}
                            <div class="scale-90 md:scale-100 p-2 bg-red-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={FaSolidSortAmountDown} size={iconWidth} color="black" />
                            </div>
                        {:else if algorithm.icon === "Search"}
                            <div class="scale-90 md:scale-100 p-2 bg-blue-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={FaSolidSearch} size={iconWidth} color="black" />
                            </div>
                        {:else if algorithm.icon === "Matrix"}
                            <div class="scale-90 md:scale-100 p-2 bg-purple-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={BiSolidChess} size={iconWidth} color="black" />
                            </div>
                        {:else if algorithm.icon === "Maths"}
                            <div class="scale-90 md:scale-100 p-2 bg-green-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={BiMath} size={iconWidth} color="black" />
                            </div>
                        {:else if algorithm.icon === "Array"}
                            <div class="scale-90 md:scale-100 p-2 bg-yellow-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={CgToggleSquare} size={iconWidth} />
                            </div>
                        {:else if algorithm.icon === "Points"}
                            <div class="scale-90 md:scale-100 p-2 bg-orange-400 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={BiScatterChart} size={iconWidth} color="black" />
                            </div>
                        {:else}
                            <div class="scale-90 md:scale-100 p-2 bg-gray-200 rounded-full mr-2 md:mr-4 outline outline-4">
                                <Icon src={FaSolidDivide} size={iconWidth} />
                            </div>
                        {/if}
                        <span class="ml-2">
                            {algorithm.name}
                        </span>
                    </button>
                {/each}
            {/if}

            <!-- Provide the input -->
            {#if input === null && selectedAlgorithm !== null}
                <Inputs
                    algorithm={selectedAlgorithm}
                    error={inputError}
                    on:submit={submitInput}
                />
            {/if}

        </div>
    </div>
{:else}
    <Divisualise bind:call algorithmName={selectedAlgorithm.name} on:reset={reset}/>
{/if}
