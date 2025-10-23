module.exports = {
  root: true,
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/', '.angular/'],

  overrides: [
    {
      // TypeScript files
      files: ['packages/**/src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        tsconfigRootDir: __dirname,
      },
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended', 'prettier'],
      plugins: ['@typescript-eslint'],
      settings: {
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: ['./tsconfig.json', './packages/*/tsconfig.json'],
          },
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
          },
        },
      },
      rules: {
        // Airbnb prefers default exports, but named exports are often better for libraries
        'import/prefer-default-export': 'off',
        'no-useless-constructor': 'off',
        'no-empty-function': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        'no-param-reassign': 'off',
        // Allow .ts file extensions in imports
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            ts: 'never',
            js: 'never',
            jsx: 'never',
            tsx: 'never',
          },
        ],
      },
    },
    {
      // JavaScript config files
      files: ['*.js', '.*.js'],
      env: {
        node: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
      },
      extends: ['airbnb-base', 'prettier'],
    },
  ],
};
