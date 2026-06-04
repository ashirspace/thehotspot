import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Lora"', "Georgia", '"Times New Roman"', "serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", '"SF Mono"', "Menlo", "Consolas", "monospace"],
      },
      colors: {
        hotspot: {
          orange: "#fe6e00",
          teal: "#0d9488",
          ink: "#0f172a",
          cosmic: "#09090d",
          warm: "#f8fafc",
        },
      },
      boxShadow: {
        soft: "0 12px 36px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
