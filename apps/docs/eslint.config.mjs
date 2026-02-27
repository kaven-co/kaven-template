import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/ui/*"],
              message: "Use @kaven/ui-base instead of local ui aliases.",
            },
            {
              group: ["@kaven/ui-base/compat/*"],
              message: "Compat imports are temporary and forbidden for app code.",
            },
            {
              group: ["./ui/*", "../ui/*"],
              message: "Use @kaven/ui-base instead of relative ui imports.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "public/**",
    "node_modules/**"
  ]),
]);

export default eslintConfig;
