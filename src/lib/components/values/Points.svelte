<script lang="ts">
    import type { Points, Point, Line } from "$lib/core/values"

    export let value: Points

    function getBackgroundColor(item: Point | Line): string {
        if ( item.colour === "black" ) {
            return "bg-black";
        }
        return `bg-${item.colour}-500`;
    }
</script>

<div class="w-full">
    <div class="flex flex-col w-64 md:w-96 aspect-square items-center mx-auto">
        <div class="w-full h-full bg-white border-4 border-black relative overflow-hidden">
            {#each value.lines as line}
                <div
                    class="{getBackgroundColor(line)} absolute"
                    style="
                        left: calc({Math.min(line.start.x, line.end.x) * 100}% + 2px);
                        top: {Math.min(line.start.y, line.end.y) * 100}%;
                        width: {Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y) * 100}%;
                        height: 4px;
                        transform-origin: 0 0;
                        transform: rotate({Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x)}rad);
                    "
                ></div>
            {/each}
            {#each value.points as point}
                <div
                    class="{getBackgroundColor(point)} absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style="left: {point.x * 100}%; top: {point.y * 100}%;"
                ></div>
            {/each}
        </div>
    </div>
</div>
