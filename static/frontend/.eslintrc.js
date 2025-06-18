module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  root: true,
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  ignorePatterns: ['build', 'node_modules', 'public'],
  rules: {
    // React specific rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'warn',
    
    // General rules - less strict for development
    'no-console': 'off', // Allow console.log for debugging
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    
    // TypeScript rules (if available)
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
}; 