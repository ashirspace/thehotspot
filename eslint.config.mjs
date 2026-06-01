import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".claude/**",
      ".next/**",
      "dist/**",
      "node_modules/**",
      "src/**/*.js",
      "src/**/*.jsx",
      "api/**",
      "vite.config.js",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
