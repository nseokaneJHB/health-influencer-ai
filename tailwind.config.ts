import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "400px",
      sm: "667px",
      md: "900px",
      lg: "1200px",
      xl: "1400px",
      "2xl": "1512px",
    },
    extend: {
      colors: {
        "primary-background": "rgb(16,24,39)",
        "primary-text": "rgb(255,255,255)",
        "secondary-background": "rgb(22,33,47)",
        "secondary-text": "rgb(146,153,165)",
        "secondary-text-light": "rgb(191,195,203)",
        success: "rgb(20,185,129)",
        "success-light": "rgb(23,52,58)",
        warning: "rgb(237,194,23)",
        danger: "rgb(238,68,68)",
      },
      fontSize: {
        "3xl": ["3rem", { lineHeight: "1.2" }],
        "2xl": ["2.5rem", { lineHeight: "1.2" }],
        xl: ["2rem", { lineHeight: "1.3" }],
        lg: ["1.5rem", { lineHeight: "1.3" }],
        md: ["1.125rem", { lineHeight: "1.4" }],
        sm: ["1rem", { lineHeight: "1.4" }],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
