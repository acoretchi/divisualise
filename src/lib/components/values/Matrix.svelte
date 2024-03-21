<script lang="ts">
    import type { Matrix, NumberValue } from "$lib/core/values";

    export let value: Matrix

    function getBackgroundColor(item: NumberValue): string {
        return item.colour ? `bg-${item.colour}-300` : "bg-white";
    }

    function getTextDecoration(item: NumberValue): string {
        return item.struck ? "line-through" : "";
    }

</script>

<div class="flex flex-col items-center overflow-x-auto">
    <div class="flex flex-col w-full overflow-x-auto">
        <div class="mx-auto w-fit border-2 border-black">
            {#each value.matrix as row, i}
                <div class="flex">
                    {#each row as item, j}
                        <div class="flex flex-col justify-center w-16 h-16 md:w-20 md:h-20 border-2 border-black">
                            <input type="number" class="{getBackgroundColor(item)} {getTextDecoration(item)} text-3xl h-full text-center md:pl-4" bind:value={item.value} disabled/>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>
