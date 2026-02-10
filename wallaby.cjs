/* eslint-disable */
module.exports = function (wallaby) {
  return {
    env: {
      type: 'node'
    },
    symlinkNodeModules: true,
    workers: { restart: true },
    files: [
      'package.json',
      'src/**/*.js',
      { pattern: 'dist/**/*.js', instrument: false },
      { pattern: 'dist/**/package.json', instrument: false }
    ],
    tests: ['test/**/*.js'],
    testFramework: 'mocha',
  };
};
