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
        },
        {
          selector: "JSXAttribute[name.name='style'] ObjectExpression > Property[key.type='Identifier']",
          message: "Unconstrained raw inline style property detected in JSX. Replace raw inline style properties with Tailwind utility classes or CSS custom variables (--*)."
        },
        {
          selector: "JSXAttribute[name.name='style'] ObjectExpression > Property[key.type='Literal'][key.value=/^(?!--).*/]",
          message: "Unconstrained raw inline style property detected in JSX. Replace raw inline style properties with Tailwind utility classes or CSS custom variables (--*)."
        }
      ]
    }
  },
  {
    files: [
      "app/**/*.{ts,tsx,js,jsx}",
      "lib/**/*.{ts,tsx,js,jsx}",
      "components/**/*.{ts,tsx,js,jsx}",
      "hooks/**/*.{ts,tsx,js,jsx}",
    ],
    ignores: ["lib/env.ts", "lib/dx/env-guard.ts", "app/generated/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct access to process.env is forbidden in application modules. Access configuration exclusively through validated schema exports in '@/lib/env'.",
        },
      ],
    },
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
