// module.exports = require("@repo/tailwind-config/tailwind.config");

import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config/tailwind.config";

const config: Pick<Config, "content" | "presets"> = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [sharedConfig],
};

export default config;
