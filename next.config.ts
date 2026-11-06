import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components rămâne oprit până când datele vin din Supabase; atunci decidem ce se cache-uiește.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
