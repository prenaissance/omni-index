import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import importPlugin from "eslint-plugin-import-x";

export default tseslint.config([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  pluginReact.configs.flat.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  eslintPluginPrettierRecommended,
  {
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx", ".mts"],
      },
      "import-x/resolver": [
        {
          typescript: {
            project: [
              "./apps/backend/tsconfig.json",
              "./apps/frontends/omni-book/tsconfig.json",
              "./proof-of-concept/tsconfig.json",
            ],
          },
        },
      ],
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          trailingComma: "es5",
        },
      ],

      "import-x/order": "error",
      "import-x/no-named-as-default-member": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      // for react-router, ignoring the path does not work
      "@typescript-eslint/no-namespace": "off",

      "no-empty-pattern": "off",
    },
  },
]);
