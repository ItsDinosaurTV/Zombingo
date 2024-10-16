/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				satan: ['Satan', 'sans-serif'],
				zombie: ['Zombie', 'sans-serif'],
				vhs: ['VHS', 'sans-serif'],
			}
		},
	},
	plugins: []
};
