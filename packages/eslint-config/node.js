// const { resolve } = require("node:path");
// const globals = require("globals");
// const pluginJs = require("@eslint/js");
// const tseslint = require("@typescript-eslint/eslint-plugin");
// const tsParser = require("@typescript-eslint/parser");

// const project = resolve(process.cwd(), "tsconfig.json");

// /** @type {import("eslint").Linter.Config} */
// module.exports = {
//   // Extend recommended ESLint configurations
//   extends: [
//     "eslint:recommended",
//     "prettier", // Integrate Prettier to disable conflicting ESLint rules
//     "turbo",
//     ...pluginJs.configs.recommended,
//     ...tseslint.configs.recommended,
//   ],

//   // Environment settings
//   env: {
//     node: true, // Enable Node.js global variables and Node.js scoping
//     es2021: true, // Support ES2021 global variables and syntax
//     jest: true, // Enable Jest testing framework globals
//   },

//   // Plugins to use
//   plugins: [
//     "only-warn", // Convert ESLint errors to warnings
//     "@typescript-eslint", // Enable TypeScript-specific linting rules
//   ],

//   // Parser options
//   parserOptions: {
//     ecmaVersion: 2021, // Enable parsing of modern ECMAScript features
//     sourceType: "module", // Enable ECMAScript modules
//     project, // Specify the TypeScript project configuration
//   },

//   // Set the parser to use for TypeScript files
//   parser: tsParser,

//   // Import resolver settings to resolve TypeScript imports
//   settings: {
//     "import/resolver": {
//       typescript: {
//         project, // Resolve TypeScript imports using the specified tsconfig.json
//       },
//     },
//   },

//   // Ignore specific patterns and directories
//   ignorePatterns: [
//     ".*.js", // Ignore dotfiles
//     "node_modules/",
//     "dist/",
//   ],

//   // Specify overrides for specific file types
//   overrides: [
//     {
//       files: ["**/*.{js,mjs,cjs,ts}"], // Apply to JavaScript and TypeScript files
//       languageOptions: {
//         globals: { ...globals.node }, // Include Node.js globals
//       },
//       rules: {
//         eqeqeq: "error", // Enforce strict equality comparisons
//         curly: "error", // Require curly braces for all control statements
//         "no-console": "warn", // Warn on console statements
//         "no-unused-vars": "off", // Disable no-unused-vars for base JavaScript
//         "@typescript-eslint/no-unused-vars": [
//           "error",
//           { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
//         ],
//         "no-implicit-coercion": "error", // Disallow implicit type coercion
//         "no-magic-numbers": [
//           "warn",
//           { ignore: [0, 1, -1], ignoreArrayIndexes: true },
//         ],
//         quotes: ["error", "single", { avoidEscape: true }], // Enforce single quotes
//         semi: ["error", "always"], // Enforce semicolons
//         indent: ["error", 2, { SwitchCase: 1 }], // Enforce 2-space indentation
//         "comma-dangle": ["error", "always-multiline"], // Enforce trailing commas
//       },
//     },
//   ],
// };
