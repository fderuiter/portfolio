import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: [
      "lib/game-utils.ts",
      "components/providers/AudioProvider.tsx",
      "lib/clipboard.ts",
      "__tests__/**",
      "vitest.setup.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/] CallExpression[callee.object.name='Math'][callee.property.name=/^(min|max)$/]",
          message: "Do not use inline nested Math.min or Math.max. Use clamp() or lerp() from lib/game-utils.ts instead."
        },
        {
          selector: "MemberExpression[object.name='navigator'][property.name='clipboard']",
          message: "Do not access navigator.clipboard directly. Use copyToClipboard from @/lib/clipboard, useClipboard hook from @/hooks/useClipboard, or <CopyButton /> component instead."
        }
      ]
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
