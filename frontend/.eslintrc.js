module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
  ],
  rules: {
    // Reglas de React
    'react/react-in-jsx-scope': 'off', // No necesario en React 17+
    'react/prop-types': 'warn', // Advertencia en lugar de error
    
    // Reglas de variables
    'no-unused-vars': ['error', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_',
      'ignoreRestSiblings': true,
      'caughtErrorsIgnorePattern': '^_'
    }],
    'no-undef': 'error',
    
    // Reglas de React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Reglas de formato
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // Reglas de mejores prácticas
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    
    // Permitir algunas excepciones comunes
    'no-empty': ['error', { 'allowEmptyCatch': true }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.config.js',
    'vite.config.js',
  ],
};