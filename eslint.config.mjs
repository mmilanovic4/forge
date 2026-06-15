import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Disable ESLint formatting rules that would conflict with Prettier.
  eslintConfigPrettier,
  {
    plugins: { "simple-import-sort": simpleImportSort },
    rules: {
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side-effect imports that are NOT styles
            ["^\\u0000(?!.*\\.(?:css|scss|sass)$)"],
            // React and Next.js (\\u0000 catches `import type` variants)
            ["^(react|next)(/|\\u0000|$)"],
            // External npm packages
            ["^@?\\w"],
            // Internal alias (@/)
            ["^@/"],
            // Relative imports (non-styles)
            ["^\\.(?!.*\\.(?:css|scss|sass)$)"],
            // Styles — always last
            ["\\.(?:css|scss|sass)$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    rules: {
      "no-undef": "error",
      "no-redeclare": "error",
      "no-unused-vars": "error",
    },
  },
]);

export default eslintConfig;
