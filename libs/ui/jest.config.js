module.exports = {
    testEnvironment: "jsdom",
    moduleNameMapper: {
        "\\.(css|less|scss)$": "identity-obj-proxy",
    },
        transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },

    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};