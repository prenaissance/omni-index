import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "prettier/prettier": "error",
      "react/react-in-jsx-scope": "off",

      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-unused-vars": "warn",

      "no-empty-pattern": "off",
    },
  },
]);
