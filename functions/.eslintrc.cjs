module.exports = {
  env: { node: true, es2022: true },
  extends: [],
  parserOptions: { ecmaVersion: "latest" },
  rules: { "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }] },
};
