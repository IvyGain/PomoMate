module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  plugins: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    __DEV__: 'readonly',
    fetch: 'readonly',
    FormData: 'readonly',
    window: 'readonly',
    document: 'readonly',
    navigator: 'readonly',
    process: 'readonly',
    NodeJS: 'readonly',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // TypeScript rules - relaxed for CI
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    
    // General rules
    'no-console': 'off', // Allow console logs for debugging
    'no-debugger': 'warn',
    'no-unused-vars': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'no-undef': 'off',
    'no-redeclare': 'off',
    
    // React rules - relaxed for CI
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
    'react/no-unescaped-entities': 'off',
    
    // Code style - turn off to avoid formatting conflicts
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'max-len': 'off',
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'web-build/',
    '.expo/',
    'dist/',
    'android/',
    'ios/',
    'backend/',
    'src/__tests__/',
    'jest.setup.js',
    'playwright-report/',
    'test-results/',
    '*.config.js',
    '*.test.js',
    '*.spec.js',
    'test-*.js',
    'debug-*.js',
    'create-*.js',
    'check-*.js',
    'run-*.js',
    'setup-*.js',
  ],
};