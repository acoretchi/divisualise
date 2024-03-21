<script lang="ts">
    import { Matrix } from "$lib/core/values";

    export let value: Matrix = Matrix.zeroes(2, 2);

    let n = 2;

    function onChangeN() {
        if (n < 2) {
            n = 2;
        }
        if (n > 8) {
            n = 8;
        }
        if (n > value.matrix[0].length) {
            for (let i = value.matrix.length; i < n; i++) {
                value.addEmptyColumn();
                value.addEmptyRow(i+1);
            }
        } else {
            while (value.matrix[0].length > n) {
                value.removeLastRow();
                value.removeLastColumn();
            }
        }
        value = value;
    }
</script>

<div class="flex flex-col mb-4">
    <span class="text-xl mb-2 md:mb-4 font-semibold">Please input a matrix</span>
    <div class="flex flex-col items-center">
        <div class="flex justify-center border-b-4 border-b-4 border-black pl-4 mb-4">
            <span class="text-lg md:text-2xl font-semibold mx-auto">Size:</span>
            <input class="md:pl-3 text-xl md:text-3xl w-12 bg-transparent text-center drop-shadow outline-none" type="number" bind:value={n} on:change={onChangeN} min=2 max=8/>
        </div>
        <div class="flex flex-col w-full overflow-x-auto">
            <div class="flex flex-col mx-auto w-fit items-center mb-2 md:mb-4 border-2 border-black overflow-x-auto">
                {#each value.matrix as row, i}
                    <div class="flex">
                        {#each row as _, j}
                            <div class="flex flex-col justify-center w-16 h-16 md:w-20 md:h-20 border-2 border-black">
                                <input type="number" class="bg-white text-2xl md:text-3xl h-full text-center md:pl-2" bind:value={value.matrix[i][j].value} />
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
