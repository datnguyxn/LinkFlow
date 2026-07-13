import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        window: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
    ignores: ['dist', 'node_modules', 'coverage', '.turbo'],
  },
];
