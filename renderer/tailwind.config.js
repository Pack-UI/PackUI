/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./renderer/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			animation: {
				jump: 'jump 0.5s ease-in-out alternate',
			},
			keyframes: {
				jump: {
					'0%': { transform: 'translate(500px,0px)' },
					'100%': { transform: 'translate(0px,0px)' },
				},
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			},
		},
	},
	plugins: [],
};
