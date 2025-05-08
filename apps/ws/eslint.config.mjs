import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist', 'node_modules'] },
  { files: ['**/*.{js,mjs,cjs}'] },
  {
    files: ['**/*.{ts}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      parser: tsParser,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      eqeqeq: 'warn',
      curly: 'warn',
      'no-console': 'warn',
      "@typescript-eslint/no-explicit-any" : "warn",
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any' : 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-implicit-coercion': 'warn',
      'no-magic-numbers': [
        'warn',
        { ignore: [0, 1, -1], ignoreArrayIndexes: true },
      ],
      quotes: ['warn', 'double', { avoidEscape: true }],
      semi: ['warn', 'always'],
      indent: ['warn', 2, { SwitchCase: 1 }],
      'comma-dangle': ['warn', 'always-multiline'],
    },
  },
];
