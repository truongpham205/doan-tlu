module.exports = {
  moduleNameMapper: {
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@models(.*)$': '<rootDir>/src/models$1',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@commons(.*)$': '<rootDir>/src/common$1',
    '^@service(.*)$': '<rootDir>/src/service$1',
    '^@middleware(.*)$': '<rootDir>/src/middleware$1',
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@routes(.*)$': '<rootDir>/src/routes$1',
    '^@src(.*)$': '<rootDir>/src$1',
    '^@root(.*)$': '<rootDir>$1',
  },
};
