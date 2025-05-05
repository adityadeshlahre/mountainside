// import js from "@eslint/js";
// import tsParser from "@typescript-eslint/parser";
// import path from "node:path";
// import { fileURLToPath } from "node:url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default [
//   js.configs.recommended,
//   {
//     ignores: [
//       "postcss.config.js",
//       "tailwind.config.ts",
//       "node_modules",
//       ".eslintrc.cjs",
//       "./turbo/**/*",
//     ],
//   },
//   {
//     languageOptions: {
//       parser: tsParser,
//       parserOptions: {
//         project: "./tsconfig.json",
//         tsconfigRootDir: __dirname,
//       },
//     },
//   },
// ];

import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default config;
