import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import functional from 'eslint-plugin-functional';
import unicorn from 'eslint-plugin-unicorn';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'functional': functional,
      'unicorn': unicorn,
    },
    rules: {
      // TypeScript strict rules - no any types allowed
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      
      // No type assertions allowed
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'never',
      }],
      
      // Additional strict type rules
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      
      // React rules
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // General code quality rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-unused-expressions': 'error',
      'no-unused-vars': 'off', // TypeScript's noUnusedLocals and noUnusedParameters handle this
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-fallthrough': 'off', // Allow switch case fallthrough
      
      // Additional rules for exhaustive switches
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'unicorn/prefer-switch': 'error',
      
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSTypePredicate',
          message: 'Type predicates are not allowed because of the unsoundness. Rethink your type design.',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'functional/no-conditional-statements': ['error', {
        allowReturningBranches: 'ifExhaustive',
      }],
      'functional/no-return-void': 'error',
      'functional/no-let': 'error',
      'functional/no-try-statements': 'error',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', 'build/', '*.js', '!eslint.config.js', 'vite.config.ts'],
  },
];