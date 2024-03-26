<div class="flex w-screen h-screen bg-gray-50 justify-center overflow-y-scroll">
    <div class="flex flex-col w-5/6 md:w-2/3 max-w-xl mt-12 md:mt-24 h-fit">
        <a  
            class="relative flex mx-auto"
            href="/"
        >
            <h1 
                class="text-4xl md:text-6xl font-bold mx-auto cursor-pointer" 
            >
                Divisualise!
            </h1>
            <div class="text-xs md:text-md bg-blue-400 rounded-full absolute left-[98%] bottom-[60%] py-1 px-2 text-white font-bold">
                Alpha!
            </div>
        </a>
        <div class="text-xs md:text-md mx-auto text-gray-400 font-semibold mb-2 md:mb-4">
            By <a href="https://armandcoretchi.com" target="_blank" class="text-blue-400 underline">Armand Coretchi</a>.
        </div>

        <div class="flex justify-center space-x-6 text-lg md:text-xl mb-4 md:mb-8 font-semibold underline text-blue-400">
            <a href="/about">
                About
            </a>
            <a href="/primer">
                Primer
            </a>
        </div>

        <div class="w-full text-md md:text-lg overflow-y-auto mb-12 md:mb-24">
            <slot />
        </div>
    </div>
</div>
