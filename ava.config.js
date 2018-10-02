export default {
  files: [
    'tests/*.js'
  ],
  sources: [
    'src/**/*.js'
  ],
  cache: true,
  babel: {
    extensions: ['js'],
    testOptions: {
      babelrc: true
    }
  }
}