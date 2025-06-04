import { defineConfig, globalIgnores } from "eslint/config";
import _import from "eslint-plugin-import";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import { fixupPluginRules } from "@eslint/compat";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/.prettierrc.js", "bin/**/*.js"]), {
    extends: compat.extends("plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"),

    plugins: {
        import: fixupPluginRules(_import),
        "@typescript-eslint": typescriptEslintEslintPlugin,
        "unused-imports": unusedImports,
    },

    languageOptions: {
        parser: tsParser,
    },

    rules: {
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "react-hooks/exhaustive-deps": "off",
        "unused-imports/no-unused-imports": 1,

        "import/order": ["error", {
            groups: ["builtin", "external", "internal", "parent", "sibling"],

            pathGroups: [{
                pattern: "src/**",
                group: "internal",
                position: "before",
            }],

            pathGroupsExcludedImportTypes: ["builtin"],

            alphabetize: {
                order: "asc",
                caseInsensitive: false,
            },

            "newlines-between": "always-and-inside-groups",
            warnOnUnassignedImports: true,
        }],

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: [
                "**/*.test.{ts,js}",
                "**/*.spec.{ts,js}",
                "scripts/**/*.{ts,js}",
                "bin/**/*.{ts,js}",
                "test/**/*.{ts,js}",
            ],
        }],
    },
}, {
    files: [
        "**/setupTests.ts",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/*.@(story|stories).*",
    ],

    rules: {
        "import/no-extraneous-dependencies": "off",
    },
}]);