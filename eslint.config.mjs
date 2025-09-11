import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // might look back on seeding files later
  {
    ignores: [
      "**/dist/**",
      "**/.data/**",
      "**/node_modules/**",
      "**/generated/**",
      "**/prisma/*.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended, // non type-checked preset
  { files: ["**/*.{ts,tsx,js,jsx}"], rules: { "no-console": "off" } },
  eslintConfigPrettier,
];
