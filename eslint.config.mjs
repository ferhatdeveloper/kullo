/** Minimal ESLint 9 flat config so `pnpm lint` can run until packages adopt stricter rules. */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.expo/**",
      "**/brag-output/**",
      "**/.agents/**",
    ],
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {},
  },
];
