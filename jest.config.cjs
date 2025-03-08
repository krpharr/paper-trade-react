module.exports = {
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src/tests"], // Tell Jest to look in 'src/tests'
};

  