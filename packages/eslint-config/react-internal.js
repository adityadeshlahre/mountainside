// const { resolve } = require("node:path");

// const project = resolve(process.cwd(), "tsconfig.json");

// /*
//  * This is a custom ESLint configuration for use with
//  * internal (bundled by their consumer) libraries
//  * that utilize React.
//  */

// /** @type {import("eslint").Linter.Config} */
// module.exports = {
//   extends: ["eslint:recommended", "prettier", "turbo"],
//   plugins: ["only-warn"],
//   globals: {
//     React: true,
//     JSX: true,
//   },
//   env: {
//     browser: true,
//   },
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
//     "dist/",
//   ],
//   overrides: [
//     // Force ESLint to detect .tsx files
//     { files: ["*.js?(x)", "*.ts?(x)"] },
//   ],
// };

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config} */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
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
