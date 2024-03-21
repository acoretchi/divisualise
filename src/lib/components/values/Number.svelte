<script lang="ts">
    import type { NumberValue } from "$lib/core/values"

    export let value: NumberValue;
    $: textColour = `text-${value.colour}-600`
    $: textDecoration = value.struck ? "line-through" : ""

</script>

{#if value.value === -Infinity}
    <div class="flex w-full items-center">
        <div class="{textColour} {textDecoration} text-4xl md:text-6xl mx-auto">-∞</div>
    </div>
{:else if value.value === Infinity}
    <div class="flex w-full items-center">
        <div class="{textColour} {textDecoration} text-4xl md:text-6xl mx-auto">∞</div>
    </div>
{:else}
    <div class="flex w-full items-center">
        <div class="{textColour} {textDecoration} text-4xl md:text-6xl mx-auto">{value.value}</div>
    </div>
{/if}
