/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/react-internal.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.lint.json",
    tsconfigRootDir: __dirname,
  },
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
