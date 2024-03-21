<script lang="ts">
    import { NumberList, NumberValue } from "$lib/core/values";

    export let value: NumberList = new NumberList([]);

    let inputBuffer: string = "";
    let focusedIndex: number | null = null;

    function onInput(event: unknown) {
        const char = inputBuffer[inputBuffer.length - 1];
        if (char === " " || char === ",") {
            const number = parseFloat(inputBuffer);
            if (!isNaN(number) && number >= -99 && number <= 99) {
                if (focusedIndex === null) {
                    value.values = [...value.values, new NumberValue(number)];
                } else {
                    value.values.splice(focusedIndex + 1, 0, new NumberValue(number));
                    focusedIndex += 1;
                }
            }
            inputBuffer = "";
        } else if (
            (isNaN(parseInt(char)) && char !== "-")
            || (isNaN(parseInt(char)) && inputBuffer.length > 1)
            || (inputBuffer.length > 2 && inputBuffer[0] !== "-") 
            || inputBuffer.length > 3
        ) {
            inputBuffer = inputBuffer.slice(0, -1);
        }
    }

    function deleteOnBackspace(event: KeyboardEvent) {
        if (inputBuffer.length === 0 && event.key === "Backspace") {
            if (focusedIndex !== null) {
                value.values = value.values.filter((_, i) => i !== focusedIndex);
                focusedIndex = null;
            } else {
                value.values = value.values.slice(0, -1);
            }
        }
    }

    function valueKeydown(event: KeyboardEvent, index: number) {
        if (event.key === "ArrowUp" && value.values[index].value < 99) {
            value.values[index].value += 1;
        } else if (event.key === "ArrowDown" && value.values[index].value > -99) {
            value.values[index].value -= 1;
        } else if (event.key === "Backspace" || event.key === "Delete") {
            value.values = value.values.filter((_, i) => i !== index);
            focusedIndex = null;
        }
    }
</script>

<div class="flex flex-col mb-4">
    <span class="text-lg md:text-xl font-semibold mb-2">Please enter a list of numbers</span>
    <div class="flex h-full w-full overflow-x-auto overflow-y-hidden">
        <div class="flex border-2 border-black mx-auto">
            {#each value.values as item, i}
                <div class="flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-black">
                    <input type="text" readonly class="bg-white text-2xl md:text-4xl w-full h-full text-center border-none ring-0 outline-none" value={item.value} />
                </div>
            {/each}
            <div class="flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-r-2 border-black">
                <input type="text" class="bg-gray-300 text-2xl md:text-4xl w-full h-full text-center border-none ring-0 outline-none" bind:value={inputBuffer} on:input={onInput} on:keydown={deleteOnBackspace} on:click={() => {focusedIndex = null}} />
            </div>
        </div>
    </div>
</div>
