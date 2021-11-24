module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ['plugin:prettier/recommended', 'prettier', 'airbnb-base', 'plugin:import/recommended'],
  plugins: ['prettier', 'import'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    camelcase: 'off',
    'object-curly-newline': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    'max-len': ['error', { code: 120 }],
    'no-extend-native': ['error', { exceptions: ['Error'] }],
    'no-unused-vars': [
      'error',
      { args: 'none', ignoreRestSiblings: true, varsIgnorePattern: '^(Op|Sequelize|sequelize|_)$' },
    ],
    // 'implicit-arrow-linebreak': ['error', 'beside'],
    'implicit-arrow-linebreak': 'off',
    'no-use-before-define': ['warn', { functions: true, classes: true, variables: true }],
    eqeqeq: 'off',
    'linebreak-style': 'off',
    'function-paren-newline': ['error', 'consistent'],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@src', './src'],
          ['@root', '.'],
          ['@controllers', './src/controllers'],
          ['@models', './src/models'],
          ['@utils', './src/utils'],
          ['@commons', './src/common'],
          ['@services', './src/service'],
          ['@middlewares', './src/middleware'],
          ['@config', './src/config'],
          ['@routes', './src/routes'],
        ],
        extensions: ['.ts', '.js', '.jsx', '.json'],
      },
    },
  },
};
