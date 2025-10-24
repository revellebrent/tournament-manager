export default [
  // replaces .eslintignore
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".vite/**",
      ".husky/**",
      "**/*.min.js",
      "**/*.map",
      "**/*.d.ts",
    ],
  },
  {
    files: ["vite.config.js"],
    rules: {
      "import/no-unresolved": "off",
    },
  },
];
