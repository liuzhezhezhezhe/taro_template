module.exports = {
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [2, 'always'],
    'space-before-function-paren': [2, 'never']
  },
  'extends': ['taro/react']
}
