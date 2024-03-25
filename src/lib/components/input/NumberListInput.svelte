<script lang="ts">
    import { NumberList, NumberValue } from "$lib/core/values";

    export let value: NumberList = new NumberList([]);
    let inputBuffers: string[] = [""];
    let focusedIndex: number | null = null;
    let inputElements: HTMLInputElement[] = [];
    $: focusedBuffer = focusedIndex !== null ? inputBuffers[focusedIndex] : null

    function onInput(event: Event, index: number) {
        if (focusedBuffer === null || focusedIndex === null) return;
        const char = inputBuffers[index][inputBuffers[index].length - 1];
        if (char === " " || char === "," || inputBuffers[index].length == 3 && inputBuffers[index][0] !== "-" || inputBuffers[index].length == 4) {
            inputBuffers[index] = inputBuffers[index].slice(0, -1);
            let number = parseFloat(inputBuffers[index]);
            if (!isNaN(number) && number >= -99 && number <= 99) {
                value.values.splice(index, 0, new NumberValue(number));
                value = value;
                if (index === inputBuffers.length - 1) {
                    inputBuffers.push(char === "-" || !Number.isNaN(Number.parseInt(char)) ? char : "");
                } else {
                    inputBuffers.splice(index+1, 0, char === "-" || !Number.isNaN(Number.parseInt(char)) ? char : "");
                    focusIndex(index + 1);
                }
                inputBuffers = inputBuffers;
                focusedIndex = index + 1;
            }
            value = value;
        } else if (
            (isNaN(parseInt(char)) && char !== "-")
            || (isNaN(parseInt(char)) && inputBuffers[index].length > 1)
            || (inputBuffers[index].length > 2 && inputBuffers[index][0] !== "-") 
            || inputBuffers[index].length > 3
        ) {
            inputBuffers[index] = inputBuffers[index].slice(0, -1);
            inputBuffers = inputBuffers;
        }
    }

    function deleteOnBackspace(event: KeyboardEvent, index: number) {
        if (inputBuffers[index].length === 0 && index != 0 && event.key === "Backspace") {
            if (index === inputBuffers.length - 1) {
                inputBuffers.splice(index, 1);
                value.values.splice(index-1, 1);
            } else {
                inputBuffers.splice(index, 1);
                value.values.splice(index, 1);
                focusIndex(index - 1);
            }
            focusedIndex = index - 1;
            inputBuffers[focusedIndex] += " "
            value = value;
            inputBuffers = inputBuffers;
        }
    }

    function focusIndex(index: number) {
        focusedIndex = index;
        let buffer = inputBuffers[index].slice()
        let inputElement = inputElements[index];
        inputElement.focus();
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
        inputElement.onblur = () => {
            if (isNaN(parseInt(inputBuffers[index]))) {
                inputBuffers[index] = buffer;
                value.values[index] = new NumberValue(parseInt(buffer));
                value = value;
            }
            focusedIndex = null
        }
    }

</script>

<div class="flex flex-col mb-4">
    <span class="text-lg md:text-xl font-semibold mb-2">Please enter a list of numbers</span>
    <div class="flex h-full w-full overflow-x-auto overflow-y-hidden">
        <div class="flex border-2 border-black mx-auto">
            {#each value.values as item, i}
                <div class="flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-black">
                    <input type="text" class="bg-white text-2xl md:text-4xl w-full h-full text-center border-none ring-0 outline-none" bind:value={inputBuffers[i]} on:input={(event) => onInput(event, i)} on:keydown={(event) => deleteOnBackspace(event, i)} readonly on:click={() => {focusIndex(i)}} bind:this={inputElements[i]} />
                </div>
            {/each}
            <div class="flex h-16 md:h-20 aspect-square items-center justify-center border-2 border-r-2 border-black">
                <input type="text" class="text-gray-800 bg-gray-400 text-2xl md:text-4xl w-full h-full text-center border-none ring-0 outline-none" bind:value={inputBuffers[inputBuffers.length - 1]} on:input={(event) => onInput(event, inputBuffers.length - 1)} on:keydown={(event) => deleteOnBackspace(event, inputBuffers.length - 1)} on:focus={() => {focusedIndex = inputBuffers.length - 1}} />
            </div>
        </div>
    </div>
</div>
