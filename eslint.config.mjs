import nextConfig from "eslint-config-next";
import local from "./eslint-plugin-local/index.js";

const config = [
  ...nextConfig,
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
    plugins: { local },
    rules: {
      "local/no-utility-classes": "error",
      "react/no-danger": "error",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "content/.generated/**", "content/demos/**/*.js", "lib/demo-bridge.js"],
  },
];

export default config;
