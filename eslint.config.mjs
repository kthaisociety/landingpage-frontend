import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import globals from "globals";
import eslint from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintComments from "eslint-plugin-eslint-comments";
import prettier from "eslint-config-prettier";
import compat from "eslint-plugin-compat";

const eslintConfig = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslint.configs.recommended,
  {
    ...prettier,
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        React: "readonly",
      },
    },
    plugins: {
      "react-refresh": reactRefresh,
      "eslint-comments": eslintComments,
      compat,
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".ts", ".tsx"],
        },
      },
      // let the `compat` eslint plugin know what polyfills are installed, to remove false positives
      polyfills: ["ResizeObserver"],
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-use-before-define": "warn",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_.*",
          argsIgnorePattern: "^_.*",
        },
      ],
      "@typescript-eslint/no-redeclare": "error",

      "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
      "react/jsx-key": "warn",
      "react/default-props-match-prop-types": "off",
      "react/forbid-prop-types": "off",
      "react/no-unknown-property": ["error", { ignore: ["css"] }],
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/button-has-type": "warn",
      "react/destructuring-assignment": "warn",
      "react/function-component-definition": "warn",
      "react/jsx-no-constructed-context-values": "warn",
      "react/jsx-no-target-blank": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-props-no-spreading": "off",
      "react/no-array-index-key": "warn",
      "react/no-unstable-nested-components": "warn",

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "import/no-default-export": "error",
      "import/extensions": [
        "error",
        "never",
        {
          styles: "always",
          jpg: "always",
          png: "always",
          json: "always",
        },
      ],
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-absolute-path": "error",
      "import/no-anonymous-default-export": "warn",
      "import/no-dynamic-require": "error",
      "import/namespace": ["error", { allowComputed: true }],
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
      "import/no-import-module-exports": "error",
      "import/no-mutable-exports": "error",
      "import/no-self-import": "error",
      "import/no-unresolved": "error",
      "import/no-useless-path-segments": "error",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
        },
      ],
      "import/prefer-default-export": "off",

      "eslint-comments/no-unused-disable": "error",
      "eslint-comments/disable-enable-pair": [
        "error",
        { allowWholeFile: true },
      ],

      "no-shadow": "off",
      "no-use-before-define": "off",
      "no-useless-constructor": "off",
      "no-redeclare": "off",
      "no-restricted-exports": "off",
      "no-unused-expressions": ["error", { allowTaggedTemplates: true }],
      "no-unused-vars": "off",
      "no-continue": "warn",
      "no-param-reassign": "warn",
      "no-plusplus": "warn",
      "no-promise-executor-return": "warn",
      "no-restricted-globals": "warn",
      "no-restricted-properties": "warn",
      "no-underscore-dangle": ["warn", { allow: ["__typename"] }],
      "no-useless-escape": "warn",
      "prefer-destructuring": "warn",
      "prefer-template": "warn",
      "prefer-const": "warn",
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["**/page.tsx"],
    rules: {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["components/ui/**/*.{ts,tsx}", "src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react/jsx-props-no-spreading": "off",
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "react/button-has-type": "off",
      "react/function-component-definition": "off",
      "react/jsx-no-useless-fragment": "off",
      "react/destructuring-assignment": "off",
      "react/no-array-index-key": "off",
      "react/no-unstable-nested-components": "off",
      "prefer-destructuring": "off",
      "no-param-reassign": "off",
      "react/jsx-no-constructed-context-values": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },
  {
    files: ["components/auth/**/*.{ts,tsx}", "app/auth/**/*.{ts,tsx}"],
    rules: {
      "react/jsx-props-no-spreading": "off",
    },
  },
  {
    files: ["tailwind.config.ts"],
    rules: {
      "import/no-default-export": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-use-before-define": "off",
    },
  },
  {
    files: ["**/layout.tsx"],
    rules: {
      "import/no-default-export": "off",
      "import/prefer-default-export": "error",
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["next.config.ts", "next.config.js"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
    ],
  }
];

export default eslintConfig;
