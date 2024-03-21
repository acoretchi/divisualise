<script lang="ts">
    import { Points, Point } from "$lib/core/values"

    export let value: Points = new Points([])

    let pointElements: HTMLDivElement[] = [];

    function handleSquareClick(event: MouseEvent) {
        const square = event.currentTarget as HTMLDivElement;
        const rect = square.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        value.addPoint(new Point(x, y));
        value = value;
    }

    function handlePointClick(event: MouseEvent, index: number) {
        event.stopPropagation();
        value.removePoint(index);
        pointElements.splice(index, 1);
        value = value;
        pointElements = pointElements;
    }
</script>

<div class="flex flex-col">
    <span class="text-lg md:text-xl font-semibold mb-2 md:mb-4">Please click on the square to input points.</span>
    <div
        class="w-full aspect-square bg-white border-4 border-black relative"
        on:click={handleSquareClick}
    >
        {#each value.points as point, i}
            <div
                class="absolute w-3 h-3 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style="left: {point.x * 100}%; top: {point.y * 100}%;"
                bind:this={pointElements[i]}
                on:click={(event) => handlePointClick(event, i)}
            />
        {/each}
    </div>
</div>
