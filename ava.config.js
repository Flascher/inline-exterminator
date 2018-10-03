export default {
  files: [
    'tests/*.js'
  ],
  sources: [
    'src/**/*.js'
  ],
  require: [
    './tests/_register.js'
  ],
  cache: true,
  babel: {
    extensions: ['js'],
    testOptions: {
      babelrc: true
    }
  }
}