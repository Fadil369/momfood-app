import js from '@eslint/js'
import globals from 'globals'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    // Node-run config files (CommonJS or ESM with Vite's __dirname/require shims).
    files: ['*.config.js', '*.config.ts', '*.config.cjs'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // TypeScript's own compiler already catches undefined identifiers; no-undef
      // produces false positives on ambient/global types (D1Database, ResponseInit, React…).
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // shadcn/ui primitives and context modules idiomatically co-export
      // variants/hooks alongside components; not worth splitting files over.
      'react-refresh/only-export-components': 'off',
    },
  },
]
