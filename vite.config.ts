import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, readdirSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    {
      name: "copy-zodiac-json",
      closeBundle() {
        const src = resolve(__dirname, "src/data/generated/zodiacs");
        const dest = resolve(__dirname, "dist/api/zodiacs");
        mkdirSync(dest, { recursive: true });
        for (const file of readdirSync(src)) {
          copyFileSync(resolve(src, file), resolve(dest, file));
        }
      },
    },
  ],
  resolve: {
    alias: {
      "~": resolve(__dirname, "src"),
    },
  },
});
