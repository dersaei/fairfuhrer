import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// TODO: eslint-plugin-react@7.37.5 (bundled in eslint-config-next@16.1.6) uses
// context.getFilename() which was removed in ESLint v10. All react/* rules are
// disabled as a workaround until eslint-config-next ships with a compatible
// eslint-plugin-react version. Remove this override once Next.js updates the
// bundled plugin (track: https://github.com/vercel/next.js/issues).
const reactPluginWorkaround = {
  rules: {
    "react/display-name": "off",
    "react/jsx-key": "off",
    "react/jsx-no-comment-textnodes": "off",
    "react/jsx-no-duplicate-props": "off",
    "react/jsx-no-target-blank": "off",
    "react/jsx-no-undef": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "off",
    "react/no-children-prop": "off",
    "react/no-danger-with-children": "off",
    "react/no-deprecated": "off",
    "react/no-direct-mutation-state": "off",
    "react/no-find-dom-node": "off",
    "react/no-is-mounted": "off",
    "react/no-render-return-value": "off",
    "react/no-string-refs": "off",
    "react/no-unescaped-entities": "off",
    "react/no-unknown-property": "off",
    "react/no-unsafe": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-render-return": "off",
  },
};

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  reactPluginWorkaround,
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
