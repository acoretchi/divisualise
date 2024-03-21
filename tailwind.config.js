/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,svelte,ts,js}"],
    safelist: [
        {
            pattern: /^bg-.+0/
        },
        {
            pattern: /^text-.+0/
        }
    ],
    theme: {
        extend: {
        },
    },
    variants: {
        extend: {
            resize: ['responsive'],
        },
    },
}

