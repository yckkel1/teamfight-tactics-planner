import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";


export default [
{ ignores: ["**/dist/**", "**/.data/**", "node_modules/**"] },
js.configs.recommended,
...tseslint.configs.recommendedTypeChecked,
{
languageOptions: {
parserOptions: {
project: [
"./tsconfig.base.json",
"./apps/*/tsconfig.json",
"./packages/*/*/tsconfig.json"
],
tsconfigRootDir: import.meta.dirname,
sourceType: "module"
}
},
rules: {
// why: allow logs in a service API
"no-console": "off"
}
},
// Disable formatting rules that conflict with Prettier
eslintConfigPrettier
];