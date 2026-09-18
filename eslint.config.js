const globals = require('globals');

module.exports = [
  {
    files: ['src/**/*.js', 'tests/**/*.js', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-constant-condition': 'error',
      'no-prototype-builtins': 'error',
      'eqeqeq': ['error', 'always'],
    },
  },
  {
    files: ['src/public/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
];
