import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Ignore patterns
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'wallaby.js', 'wallaby.cjs'],
  },

  // Base recommended rules
  js.configs.recommended,

  // Import plugin recommended config
  importX.flatConfigs.recommended,

  // Prettier config (disables formatting rules)
  prettierConfig,

  // Main configuration for JS files
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    plugins: {
      prettier,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
        ...globals.es2020,
      },
    },
    settings: {
      'import-x/ignore': ['@theqrl/mldsa87'],
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',

      // Import rules
      'import-x/extensions': ['error', 'ignorePackages'],
      'import-x/namespace': 'off',

      // Disabled rules (matching previous airbnb overrides)
      'max-classes-per-file': 'off',
      'no-bitwise': 'off',
      'no-plusplus': 'off',
    },
  },
];
