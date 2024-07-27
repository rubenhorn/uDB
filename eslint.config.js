const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    {
        languageOptions: {
            sourceType: "commonjs",
            globals: {
                afterEach: "readonly",
                beforeAll: "readonly",
                beforeEach: "readonly",
                describe: "readonly",
                expect: "readonly",
                test: "readonly",

                DriveApp: "readonly",
                LockService: "readonly",
                ScriptApp: "readonly",
                Utilities: "readonly",
            },
        },
    },
    {
        rules: {
            "no-prototype-builtins": "off",
            quotes: ["error", "double"],
        },
    },
];
