<script lang="ts">
    import { NumberValue } from "$lib/core/values";

    export let value: NumberValue = new NumberValue(0);
</script>

<div class="flex flex-col mb-2 md:mb-4">
    <span class="text-lg md:text-xl font-semibold">Please enter a number</span>
    <input class="mx-auto text-4xl md:text-6xl w-48 md:w-80 md:pl-4 bg-transparent text-center border-b-4 border-black drop-shadow outline-0" type="number" bind:value={value.value} />
</div>
