// const { resolve } = require("node:path");

// const project = resolve(process.cwd(), "tsconfig.json");

// /** @type {import("eslint").Linter.Config} */
// module.exports = {
//   extends: [
//     "eslint:recommended",
//     "prettier",
//     require.resolve("@vercel/style-guide/eslint/next"),
//     "turbo",
//   ],
//   globals: {
//     React: true,
//     JSX: true,
//   },
//   env: {
//     node: true,
//     browser: true,
//   },
//   plugins: ["only-warn"],
//   settings: {
//     "import/resolver": {
//       typescript: {
//         project,
//       },
//     },
//   },
//   ignorePatterns: [
//     // Ignore dotfiles
//     ".*.js",
//     "node_modules/",
//   ],
//   overrides: [{ files: ["*.js?(x)", "*.ts?(x)"] }],
// };

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import pluginNext from "@next/eslint-plugin-next";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      "@next/next": pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs["core-web-vitals"].rules,
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      "react/react-in-jsx-scope": "off",
    },
  },
];
