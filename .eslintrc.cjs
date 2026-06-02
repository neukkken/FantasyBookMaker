/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: [
    'eslint:recommended',
    '@electron-toolkit',
    '@electron-toolkit/eslint-config-ts',
    '@electron-toolkit/eslint-config-ts/eslint-recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/globals': 'off',
    'react-hooks/immutability': 'off',
    'react-hooks/preserve-manual-memoization': 'off',
    'react-hooks/purity': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-unknown-property': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-unused-vars': 'off',
    'no-empty': 'warn',
    'no-useless-escape': 'warn',
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true }
    ]
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.cjs'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ]
}
