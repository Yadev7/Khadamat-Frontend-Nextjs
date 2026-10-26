import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Hydration guards (setMounted(true)) and fetch-on-mount patterns are
      // intentional in this app; this rule is too strict for them.
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;