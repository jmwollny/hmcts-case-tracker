module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
};