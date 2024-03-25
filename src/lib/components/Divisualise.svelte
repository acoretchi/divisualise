<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from 'svelte';

    // @ts-ignore
    import Icon from "svelte-icons-pack/Icon.svelte";
    import FaSolidStepBackward from "svelte-icons-pack/fa/FaSolidStepBackward";
    import FaSolidStepForward from "svelte-icons-pack/fa/FaSolidStepForward";
    import FaSolidBackward from "svelte-icons-pack/fa/FaSolidBackward";
    import FaSolidForward from "svelte-icons-pack/fa/FaSolidForward";
    import FaSolidPlay from "svelte-icons-pack/fa/FaSolidPlay";
    import FaSolidPause from "svelte-icons-pack/fa/FaSolidPause";
    import FaSave from "svelte-icons-pack/fa/FaSave";
    import FaSolidSave from "svelte-icons-pack/fa/FaSolidSave";
    import FaSolidChevronLeft from "svelte-icons-pack/fa/FaSolidChevronLeft";
    import HiOutlineVideoCamera from "svelte-icons-pack/hi/HiOutlineVideoCamera";
    import HiSolidVideoCamera from "svelte-icons-pack/hi/HiSolidVideoCamera";
    import ImCross from "svelte-icons-pack/im/ImCross";

    import panzoom from "panzoom";
    import type { PanZoom } from "panzoom";

    import RecursiveCallComponent from "$lib/components/RecursiveCall.svelte";
    import Value from "$lib/components/values/Value.svelte"
    import type { RecursiveCall, IOValue, IOValueObject } from "$lib/core/recursive_call"


    export let call: RecursiveCall<IOValueObject<any>, IOValue | IOValueObject<any>>;
    export let algorithmName: string;

    const dispatch = createEventDispatcher();
    let container: HTMLDivElement;
    let pz: PanZoom;
    let highlightedCall: RecursiveCall<IOValueObject<any>, IOValue | IOValueObject<any>> | null = null
    let callComponent: RecursiveCallComponent<IOValueObject<any>, IOValue | IOValueObject<any>>;
    let detailsStepIndex = 0
    let detailsKeyframeIndex = 0
    let detailsPlaying = false
    let keyframesPlaying = false
    let playing = false
    let showDetails = false
    let lockCamera = true
    let playbackSpeed = 2

    // When the highlighted call changes, move to the start of the details
    $: if (highlightedCall !== null) {
        detailsStepIndex = 0
        detailsKeyframeIndex = 0
    }

    // Set the value keyframes as the value keyframes of the current details step
    $: valueKeyframes = (
        (
            highlightedCall !== null &&
            highlightedCall.details()[detailsStepIndex].valueKeyframes
        ) ?
        highlightedCall.details()[detailsStepIndex].valueKeyframes :
        null
    )

    $: keyframesEnded = (
        highlightedCall !== null &&
        (
            valueKeyframes ?
            detailsKeyframeIndex === valueKeyframes.length - 1 :
            true
        )
    )

    $: detailsEnded = (
        highlightedCall !== null &&
        detailsStepIndex === highlightedCall.details().length - 1 &&
        keyframesEnded
    )

    function stepKeyframes() {
        if (highlightedCall !== null && valueKeyframes) {
            detailsKeyframeIndex = Math.min(valueKeyframes.length - 1, detailsKeyframeIndex + 1)
        }
    }

    function stepBackKeyframes() {
        if (highlightedCall !== null && valueKeyframes) {
            detailsKeyframeIndex = Math.max(0, detailsKeyframeIndex - 1)
        }
    }

    async function playKeyframes() {
        if (highlightedCall !== null && !keyframesEnded && !keyframesPlaying) {
            keyframesPlaying = true;
            while (!keyframesEnded && keyframesPlaying) {
                stepKeyframes();
                await new Promise(resolve => setTimeout(resolve, 500 / playbackSpeed))
            }
            keyframesPlaying = false;
        }
    }

    async function stepDetails() {
        if (highlightedCall !== null) {
            await playKeyframes()
            const currentIndex = detailsStepIndex
            detailsStepIndex = Math.min(highlightedCall.details().length - 1, detailsStepIndex + 1)
            if (currentIndex !== detailsStepIndex) {
                detailsKeyframeIndex = 0
            } 
        }
    }

    function stepBackDetails() {
        if (highlightedCall !== null) {
            detailsStepIndex = Math.max(0, detailsStepIndex - 1)
            detailsKeyframeIndex = 0
        }
    }

    async function playDetails() {
        if (highlightedCall !== null && !detailsEnded && !detailsPlaying) {
            detailsPlaying = true;
            while (!detailsEnded && detailsPlaying) {
                await stepDetails();
                await new Promise(resolve => setTimeout(resolve, 4000 / playbackSpeed))
            }
            detailsPlaying = false;
        }
    }

    async function step() {
        if (highlightedCall === null && !call.isDivided()) {
            highlightedCall = call
            return
        }
        if (
            highlightedCall === null 
            || detailsEnded 
            || highlightedCall !== call.lastActedUpon()
            || !showDetails
        ) {
            callComponent.step()
            call = call
        }
        else {
            await stepDetails()
        }
    }

    function stepBack() {
        if (
            highlightedCall === null
            || (
                detailsStepIndex === 0
                && detailsKeyframeIndex === 0
            )
            || highlightedCall !== call.lastActedUpon()
            || !showDetails
        ) {
            callComponent.back()
            call = call
        }
        else {
            stepBackDetails()
        }
    }

    async function play() {
        if (playing) {
            return
        }
        playing = true;
        while (!call.isSolved() && playing || (!detailsEnded && showDetails)) {
            await step()
            await new Promise(resolve => setTimeout(resolve, 2000 / playbackSpeed))
        }
        playing = false;
    }

    function onHighlightedPosition(e: CustomEvent<{ x: number, y: number }>) {
        if (!lockCamera) {
            return
        }

        // We map the screen-space coordinates to the panzoom view-space coordinates
        const transform = pz.getTransform();
        const containerRect = container.getBoundingClientRect();

        const relativeX = e.detail.x - containerRect.left;
        const relativeY = e.detail.y - containerRect.top;

        const newX = (containerRect.width / 2) * (1 + (1 - transform.scale) / transform.scale) - relativeX
        const newY = (containerRect.height / 2) * (1 + (1 - transform.scale) / transform.scale) - relativeY

        // Move the panzoom view to the new translation smoothly
        pz.smoothMoveTo(newX, newY)
    }

    function resetCall() {
        call.reset()
        call = call
        highlightedCall = call
    }

    function toggleMemoise() {
        call.toggleMemoise()
        call = call
    }

    function updateCall() {
        call = call
    }

    onMount(() => {
        pz = panzoom(container, {
            maxZoom: 1,
            minZoom: 0.1,
            bounds: false,
            zoomSpeed: 0.065,
            onTouch: (e) => {
                return false
            },
        });
    });
    
</script>


<div class="flex flex-col md:flex-row w-screen h-screen overflow-clip">

    <div 
        class="relative flex flex-col w-full h-full bg-gray-100 overflow-clip"
    >
        <!-- Controls -->
        <div class="absolute flex flex-col md:flex-row md:space-x-6 items-center bottom-0 w-full z-50 p-3 md:p-4">

            <div class="flex w-full md:w-fit mb-2 md:mb-0">
                <div class="space-x-1">
                    <!-- Reset -->
                    <button 
                        on:click={resetCall}
                        disabled={!call.isDivided() || playing}
                        class="rounded-full p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-black hover:scale-110 active:scale-90 hover:outline hover:outline-blue-400 hover:outline-2"
                        class:bg-white={call.isDivided() && !playing}
                        class:bg-gray-400={!call.isDivided() || playing}
                    >
                        <Icon src={ImCross} size="16" color={call.isDivided() ? "#9ca3af" : "black"}/>
                    </button>

                    <!-- Lock camera -->
                    {#if lockCamera}
                        <button on:click={() => lockCamera = false}
                            class="bg-white rounded-full p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-black hover:scale-110 active:scale-90 hover:outline hover:outline-blue-400 hover:outline-2"
                        >
                            <div class="brightness-0">
                                <Icon src={HiSolidVideoCamera} size="16" color="black"/>
                            </div>
                        </button>
                    {:else}
                        <button on:click={() => { lockCamera = true ; highlightedCall = highlightedCall }}
                            class="bg-white rounded-full p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-black hover:scale-110 active:scale-110"
                        >
                            <div class="brightness-0">
                                <Icon src={HiOutlineVideoCamera} size="16" color="black"/>
                            </div>
                        </button>
                    {/if}

                    <!-- Toggle Memoisation -->
                    {#if call.isMemoisable()}
                        <button 
                            on:click={toggleMemoise}
                            disabled={playing}
                            class="bg-white rounded-full p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-black hover:scale-110 active:scale-90 hover:outline hover:outline-blue-400 hover:outline-2"
                            class:bg-white={!playing}
                            class:bg-gray-400={playing}
                        >
                            {#if call.memoise}
                                <Icon src={FaSolidSave} size="16"/>
                            {:else}
                                <Icon src={FaSave} size="16"/>
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>

            <div class="flex w-full md:w-fit justify-between md:justify-start md:space-x-8 items-center">
                <!-- Playback -->
                <div class="flex rounded-full hover:outline hover:outline-blue-400 hover:outline-2">
                    
                    <!-- Step back -->
                    <button 
                        on:click={stepBack}
                        disabled={playing || !call.isDivided()}
                        class="p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-r-2 border-black rounded-l-full hover:z-10 active:z-10 pl-2 md:pl-3"
                        class:bg-white={!playing && call.isDivided()}
                        class:bg-gray-400={playing || !call.isDivided()}
                    >
                        <Icon 
                            src={FaSolidStepBackward} 
                            size="16" 
                            color={"black"}
                        />
                    </button>

                    <!-- Play/Pause -->
                    <button 
                        on:click={() => {playing = false; detailsPlaying = false; keyframesPlaying = false}}
                        disabled={!playing && !detailsPlaying && !keyframesPlaying}
                        class="p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-x-2 border-black hover:z-10 active:z-10"
                        class:bg-white={playing || detailsPlaying || keyframesPlaying}
                        class:bg-gray-400={!playing && !detailsPlaying && !keyframesPlaying}
                    >
                        <Icon 
                            src={FaSolidPause} 
                            size="16" 
                            color={"black"}
                        />
                    </button>
                    <button 
                        on:click={play}
                        disabled={playing || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null)}
                        class="p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-x-2 border-black hover:z-10 active:z-10"
                        class:bg-white={!(playing || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null))}
                        class:bg-gray-400={playing || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null)}

                    >
                        <Icon 
                            src={FaSolidPlay} 
                            size="16" 
                            color={"black"}
                        />
                    </button>

                    <!-- Step forward -->
                    <button 
                        on:click={step}
                        disabled={
                            playing 
                            || detailsPlaying 
                            || keyframesPlaying 
                            || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null)
                        }
                        class="p-1.5 md:p-2 cursor-pointer drop-shadow-md hover:drop-shadow-lg border-4 border-l-2 border-black hover:z-10 active:z-10 rounded-r-full pr-2 md:pr-3"
                        class:bg-white={!(
                            playing 
                            || detailsPlaying 
                            || keyframesPlaying 
                            || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null)
                        )}
                        class:bg-gray-400={
                            playing 
                            || detailsPlaying 
                            || keyframesPlaying 
                            || call.isSolved() && (detailsEnded || !showDetails || highlightedCall === null)
                        }
                    >
                        <Icon 
                            src={FaSolidStepForward} 
                            size="16" 
                            color={"black"}
                        />
                    </button>

                </div>

                <!-- Playback Speed -->
                <input 
                    id="playback-speed"
                    type="range" 
                    min="1" 
                    max="5" 
                    step="0.01"
                    bind:value={playbackSpeed} 
                    class="cursor-pointer appearance-none bg-transparent"
                />
            </div>

        </div>

        <!-- Header -->
        <div class="flex p-3 md:p-4 z-50">
            <h1 class="text-3xl font-bold cursor-pointer" on:click={() => dispatch("reset")}>Divisualise!</h1>
        </div>

        <!-- Main -->
        <div class="flex grow w-full h-full justify-center">
            <div class="flex flex-col w-full h-full items-center pt-[20%] touch-none outline-none" bind:this={container}>
                <!-- Show the call -->
                <RecursiveCallComponent
                    bind:this={callComponent} 
                    call={call} 
                    title={algorithmName}
                    on:update={updateCall}
                    on:highlightedPosition={onHighlightedPosition}
                    on:callReset={updateCall}
                    bind:highlightedCall
                    bind:detailsStepIndex
                    bind:detailsKeyframeIndex
                />
            </div>
        </div>

    </div>

    <!-- Details -->
    <div class="flex flex-col md:h-full max-w-1/2 bg-white drop-shadow-2xl border-t-4 md:border-l-4 md:border-t-0 border-black grow-0 transition-all duration-200 ease-in-out transform max-h-[45vh] md:max-h-full {showDetails ? 'h-full md:h-full md:w-[60rem]' : 'h-16 md:w-[4rem]'}"
        class:overflow-y-hidden={!showDetails}
        class:overflow-y-auto={showDetails}
    >
        <div class="flex flex-col items-center min-h-fit {highlightedCall !== null ? 'md:items-start' : ''} w-full md:h-full md:flex-row {showDetails ? 'h-full' : 'h-16'}">

            <!-- Open / Close -->
            <button 
                class="md:h-full cursor-pointer"
                on:click={() => showDetails = !showDetails}
            >
                <div class="w-full p-4 transition-all transform duration-200 {showDetails ? '-rotate-90 md:rotate-180' : 'rotate-90 md:rotate-0'}">
                    <Icon src={FaSolidChevronLeft} size="24" />
                </div>
            </button>

            <!-- Body -->
            {#if showDetails}
                <div class="h-full min-h-fit pb-2 md:py-4 px-4 md:pl-0 md:pr-8 w-full max-w-full overflow-x-auto">
                    {#if highlightedCall !== null}
                        <div class="flex flex-col">

                            <!-- Details controls -->
                            {#if highlightedCall.details().length >= 1}


                                <!-- Playback -->
                                <div class="flex rounded-full w-full justify-center mb-2 md:mb-4 hover:outline hover:outline-blue-400 hover:outline-2">

                                    <!-- Step back details -->
                                    <button 
                                        on:click={stepBackDetails}
                                        disabled={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsStepIndex === 0
                                        }
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-r-2 border-black rounded-l-full hover:z-10 active:z-10 pl-3"
                                        class:bg-white={!(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsStepIndex === 0
                                        
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsStepIndex === 0
                                        }
                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidBackward} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>
                                    
                                    <!-- Step back -->
                                    <button 
                                        on:click={stepBackKeyframes}
                                        disabled={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsKeyframeIndex === 0
                                        }
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-x-2 border-black hover:z-10 active:z-10"
                                        class:bg-white={!(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsKeyframeIndex === 0
                                        
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsKeyframeIndex === 0
                                        }
                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidStepBackward} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>

                                    <!-- Play/Pause -->
                                    <button 
                                        on:click={() => {detailsPlaying = false; keyframesPlaying = false}}
                                        disabled={
                                            playing
                                            || !detailsPlaying
                                            || !keyframesPlaying
                                        }
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-x-2 border-black hover:z-10 active:z-10"
                                        class:bg-white={!(
                                            playing
                                            || !detailsPlaying
                                            || !keyframesPlaying
                                        
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || !detailsPlaying
                                            || !keyframesPlaying
                                        }
                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidPause} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>
                                    <button 
                                        on:click={playDetails}
                                        disabled={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded && keyframesEnded
                                        }
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-x-2 border-black hover:z-10 active:z-10"
                                        class:bg-white={!(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded && keyframesEnded
                                        
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded && keyframesEnded
                                        }

                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidPlay} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>

                                    <!-- Step forward -->
                                    <button 
                                        on:click={stepKeyframes}
                                        disabled={(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            ||  keyframesEnded
                                        )}
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-x-2 border-black hover:z-10 active:z-10"
                                        class:bg-white={!(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || keyframesEnded
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || keyframesEnded
                                        }
                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidStepForward} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>

                                    <!-- Details Forward -->
                                    <button 
                                        on:click={stepDetails}
                                        disabled={(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded
                                            || detailsStepIndex === highlightedCall.details().length - 1
                                        )}
                                        class="w-full p-1.5 md:p-2 cursor-pointer border-4 border-l-2 border-black hover:z-10 active:z-10 rounded-r-full pr-3"
                                        class:bg-white={!(
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded
                                            || detailsStepIndex === highlightedCall.details().length - 1
                                        )}
                                        class:bg-gray-400={
                                            playing
                                            || detailsPlaying
                                            || keyframesPlaying
                                            || detailsEnded
                                            || detailsStepIndex === highlightedCall.details().length - 1
                                        }
                                    >
                                        <div class="w-full flex justify-center">
                                            <Icon 
                                                src={FaSolidForward} 
                                                size="16" 
                                                color={"black"}
                                            />
                                        </div>
                                    </button>

                                </div>


                                <p class="mb-4 text-lg md:text-xl font-semibold">{highlightedCall.details()[detailsStepIndex].text}</p>
                                {#if valueKeyframes}
                                    <Value value={valueKeyframes[detailsKeyframeIndex]} capitalise={false}/>
                                {/if}
                            {:else}
                                <div class="w-full h-full flex items-center justify-center">
                                    <h2 class="text-2xl font-bold text-gray-300">No details to show.</h2>
                                </div>
                            {/if}
                        </div>
                    {:else}
                        <div class="w-full h-full flex items-center justify-center">
                            <h2 class="text-2xl font-bold text-gray-300">No call selected</h2>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>

</div>


<style>
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 2px 0 rgba(0,0,0,0.2);
        border: 4px solid black;
        border-radius: 50%;
        transform: translateY(-40%);
    }

    input[type=range]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        background: white;
        cursor: pointer;
        box-shadow: 0 0 2px 0 rgba(0,0,0,0.2);
        border: 4px solid black;
        border-radius: 50%;
        transform: translateY(-40%);
    }

    input[type=range]:hover::-webkit-slider-thumb {
        outline: 2px solid #60a5fa;
        transform: scale(1.05) translateY(-38%);
    }

    input[type=range]:active::-webkit-slider-thumb {
        outline: 2px solid #60a5fa;
        transform: scale(0.95) translateY(-42%);
    }

    input[type=range]:hover::-moz-range-thumb {
        outline: 2px solid #60a5fa;
        transform: matrix(1.05, 0, 0, 1.05, 0, -38%)
    }

    input[type=range]:active::-moz-range-thumb {
        outline: 2px solid #60a5fa;
        transform: matrix(0.95, 0, 0, 0.95, 0, -42%)
    }

    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0 0 2px 0 rgba(0,0,0,0.2);
        background: black;
        border-radius: 1.3px;
    }

    input[type=range]::-moz-range-track {
        width: 100%;
        height: 4px;
        cursor: pointer;
        animate: 0.2s;
        box-shadow: 0 0 2px 0 rgba(0,0,0,0.2);
        background: black;
        border-radius: 1.3px;
    }
</style>
