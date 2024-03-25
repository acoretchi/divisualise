<script lang="ts" generics="In extends IOValueObject<In>, Out extends IOValue | IOValueObject<Out>">
    import { createEventDispatcher } from "svelte";

    import type { RecursiveCall } from "$lib/core/recursive_call"
    import { DivideCase } from "$lib/core/recursive_call"
    import type { IOValueObject, IOValue } from "$lib/core/recursive_call";
    import Value from "$lib/components/values/Value.svelte";

    import Icon from "svelte-icons-pack/Icon.svelte";
    import ImCross from "svelte-icons-pack/im/ImCross";
    import FiDivide from "svelte-icons-pack/fi/FiDivide";
    import AiOutlineMergeCells from "svelte-icons-pack/ai/AiOutlineMergeCells";
    import BiFastForward from "svelte-icons-pack/bi/BiFastForward";


    export let call: RecursiveCall<In, Out>;
    export let highlightedCall: RecursiveCall<In, Out> | null = null;

    export let detailsHighlight: boolean = false;
    export let detailsStepIndex: number
    export let detailsKeyframeIndex: number
    export let title: string | null = null;
    const dispatch = createEventDispatcher();
    let card: HTMLDivElement;

    $: if (highlightedCall === call) {
        let rect = card.getBoundingClientRect()
        dispatch("highlightedPosition", {
            x: rect.left + rect.width / 2,
            y: rect.top + (2 * rect.height) / 3,
        })
    }

    function preserveHighlight(fn: () => void) {
        let highlighted = false
        if (highlightedCall === call) {
            highlighted = true
        }
        fn()
        if (highlighted) {
            highlightedCall = call
        }
    }

    export function step(highlightCall: boolean = true) {
        const next = call.step()
        if (next && highlightCall) {
            highlightedCall = next
        }
        call = call
    }

    export function back() {
        const prev = call.back()
        if (prev) {
            highlightedCall = prev
        }
        call = call
    }

    export function conquer() {
        preserveHighlight(() => {
            step(false)
            if (!call.isSolved()) {
                setTimeout(() => {
                    conquer()
                }, 40);
            }
        })
        call = call
        dispatch("update");
    }

    function divide() {
        preserveHighlight(() => {
            call.divide();
        })
        call = call
        dispatch("update");
    }

    export function reset() {
        preserveHighlight(() => {
            call.reset()
        })
        call = call
        dispatch("update");
    }

    function update() {
        call = call
        dispatch("update");
    }

    function highlightSelf() {
        if (highlightedCall === call) {
            highlightedCall = null
        }
        else {
            highlightedCall = call
        }
    }

</script>


<div class="flex flex-col h-fit w-fit items-center">

    <div class="flex flex-col transition duration-200 ease-out hover:scale-105 items-center">
        <!-- Title -->
        {#if title}
            <div 
                class="flex w-fit justify-center pt-2 px-8"
                class:pb-2={!(highlightedCall == call || highlightedCall?.memoisedCall() == call || detailsHighlight)}
                class:pb-6={highlightedCall == call || highlightedCall?.memoisedCall() == call || detailsHighlight}
            >
                <span class="font-semibold text-3xl md:text-4xl text-nowrap whitespace-nowrap w-fit">
                    {title}
                </span>
            </div>
        {/if}

        <!-- Card -->
        <div
            on:click|stopPropagation={highlightSelf}
            on:keydown={e => e.key === "Enter" && highlightSelf()}
            role="button"
            tabindex="0"
            class="flex bg-white flex-col justify-center w-fit h-fit rounded-lg mx-8 shadow-2xl"
            class:outline={highlightedCall == call || highlightedCall?.memoisedCall() == call || detailsHighlight}
            class:outline-[16px]={highlightedCall == call || highlightedCall?.memoisedCall() == call || detailsHighlight}
            class:outline-blue-400={highlightedCall == call || highlightedCall?.memoisedCall() == call || detailsHighlight}
            bind:this={card}
        >
            <!-- Colour Header -->
            {#if !call.isSolved()}
                <div class="w-full h-8 rounded-t-lg border-4 border-black"
                    class:bg-gray-400={!call.isDivided()}
                    class:bg-red-400={call.isDivided() && !call.isCombinable()}
                    class:bg-yellow-400={call.isCombinable()}
                />
            {:else}
                <div 
                    class="flex w-full justify-center p-4 rounded-t-lg border-black border-4"
                    class:bg-blue-400={call.isMemoised()}
                    class:bg-green-400={call.isStrictlySolved()}
                >
                    <div 
                        class="w-full h-full"
                    >
                        <Value value={call.result()} />
                    </div>
                </div>
            {/if}

            <div class="p-3 border-x-4 border-b-4 border-black">
                <!-- Value -->
                <Value value={call.input()} dividers={false} />

                <!-- Buttons -->
                <div class="flex w-full h-fit items-center">
                    <div class="flex w-1/2 space-x-2 items-center">
                        <button 
                            class="transition duration-200 ease-out hover:scale-125"
                            on:click|stopPropagation={reset}
                            disabled={!call.isDivided()}
                        >
                            <div class:opacity-15={!call.isDivided()}>
                            <Icon src={ImCross} size="16" />
                            </div>
                        </button>
                    </div>
                    <div class="flex w-1/2 justify-end space-x-2 items-center ml-2">
                        <button 
                            class="transition duration-200 ease-out hover:scale-125"
                            on:click|stopPropagation={divide}
                            disabled={!call.isDivisible()}
                        >
                            <Icon src={FiDivide} size="20" color={
                                !call.isDivisible() ? "lightgray" : "red"
                            }/>
                        </button>
                        <button 
                            class="transition duration-200 ease-out hover:scale-125"
                            on:click|stopPropagation={conquer}
                            disabled={!call.isCombinable()}
                        >
                            <Icon src={AiOutlineMergeCells} size="20" color={
                                !call.isCombinable() ? "lightgray" : "#c7a312"
                            }/>
                        </button>
                        <button 
                            class="transition duration-200 ease-out hover:scale-125"
                            on:click|stopPropagation={conquer}
                            disabled={
                                call.isSolved() 
                                || (!call.isDivided() && !call.isDivisible())
                                || call.isCombinable()
                            }
                        >
                            <Icon src={BiFastForward} size="24" color={
                                (
                                    call.isSolved() 
                                    || (!call.isDivided() && !call.isDivisible()) 
                                    || call.isCombinable()
                                ) ? "lightgray" : "green"
                            }/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Sub-calls -->
    {#if !call.isBaseCase() && call._state.type != "undivided" && call._state.case instanceof DivideCase}
        <div class="w-1 h-24 bg-black -z-10"></div>
        <div class="flex justify-center mx-2">
            {#if Object.keys(call._state.case.calls_and_positions()).length === 1}
                <svelte:self 
                    call={Object.values(call._state.case.calls_and_positions())[0].call} 
                    bind:detailsStepIndex
                    bind:detailsKeyframeIndex
                    detailsHighlight={
                        (
                            highlightedCall == call
                            && call.details()[detailsStepIndex].highlightedCalls
                        ) ?
                        call.details()[detailsStepIndex].highlightedCalls.includes(name)
                        : false
                    }
                    title={highlightedCall == call ? name : null}
                    on:update={update}
                    on:hightlight 
                    on:highlightedPosition
                    bind:highlightedCall
                />
            {:else}
                {#each Object.entries(call._state.case.calls_and_positions()) as [name, next]}
                    <div class="relative">
                        {#if next.position === "left"}
                            <div class="relative w-1/2 h-24 border-black border-t-4 border-l-4 left-[50%] -z-10" />
                        {:else if next.position === "middle"}
                            <div class="relative h-24 w-full border-black border-t-4 -z-10">
                                <div class="h-full w-0 border-x-2 border-black mx-auto" />
                            </div>
                        {:else}
                            <div class="relative w-1/2 h-24 border-black border-t-4 border-r-4 -z-10" />
                        {/if}
                        <svelte:self 
                            call={next.call} 
                            bind:detailsStepIndex
                            bind:detailsKeyframeIndex
                            detailsHighlight={
                                (
                                    highlightedCall == call
                                    && call.details()[detailsStepIndex].highlightedCalls
                                ) ?
                                call.details()[detailsStepIndex].highlightedCalls.includes(name)
                                : false
                            }
                            title={highlightedCall == call ? name : null}
                            on:update={update}
                            on:highlight
                            on:highlightedPosition
                            bind:highlightedCall
                        />
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>
