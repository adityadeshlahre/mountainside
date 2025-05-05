module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "js", "json"],
  transformIgnorePatterns: ["node_modules/(?!jest-websocket-mock)"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1", // Map 'src/*' to the actual 'src/' directory
  },
};
