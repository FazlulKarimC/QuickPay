module.exports = {
    root: true,
    extends: ["@repo/eslint-config/next.js"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: true,
    },
    ignorePatterns: [
        "build-debug.js",
        "next.config.js",
        "postcss.config.js",
    ],
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.d.ts"],
            rules: {
                "no-unused-vars": "off",
                "no-undef": "off",
                "no-redeclare": "off",
            },
        },
    ],
};
