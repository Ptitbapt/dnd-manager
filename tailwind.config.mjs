// tailwind.config.mjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { medieval: ["Cinzel", "serif"] },
      colors: { medieval: { wood: "#785436" } },
    },
  },
  plugins: [],
};
