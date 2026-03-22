import type { Config } from "tailwindcss";
import { baseConfig } from "@videoforge/tailwind-config";

const config: Config = {
  ...baseConfig,
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    ...baseConfig.theme,
  },
};

export default config;
