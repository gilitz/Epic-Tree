module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
  ],
  root: true,
  env: {
    node: true,
    es6: true,
  },
  ignorePatterns: ['dist', 'node_modules', 'static'],
  rules: {
    // TypeScript specific rules - less strict
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // General rules - less strict
    'no-console': 'off', // Allow console.log for debugging
    'no-unused-vars': 'off', // Use TypeScript version instead
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
  },
}; 