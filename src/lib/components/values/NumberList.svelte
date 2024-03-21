<script lang="ts">
    import type { NumberList, NumberValue } from "$lib/core/values"

    export let value: NumberList;

    function getBackgroundColor(item: NumberValue): string {
        return `bg-${item.colour}-300`;
    }

    function getTextDecoration(item: NumberValue): string {
        return item.struck ? "line-through" : "";
    }
</script>

<div class="flex overflow-x-auto overflow-y-hidden mx-auto">
    <div class="flex border-2 border-black mx-auto">
        {#if value.values.length === 0}
            <div class="flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-black">
                <input type="text" class="w-full h-full text-center bg-gray-200" readonly />
            </div>
        {:else}
            {#each value.values as item, i}
                <div class="{getBackgroundColor(item)} flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-black">
                    <input type="text" class="{getBackgroundColor(item)} {getTextDecoration(item)} text-3xl md:text-4xl w-full h-full text-center" value={item.value} readonly />
                </div>
            {/each}
        {/if}
    </div>
</div>
