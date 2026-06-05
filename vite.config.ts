import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { existsSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function apiRouteFromRequest(request: IncomingMessage) {
  const rawUrl = request.url || "/";
  const pathname = new URL(rawUrl, "http://localhost").pathname;
  const [, apiPrefix, route] = pathname.split("/");
  if (apiPrefix !== "api" || !route) return null;
  return route;
}

function localApiPlugin(): Plugin {
  return {
    name: "thehotspot-local-api",
    configureServer(server: ViteDevServer) {
      loadLocalEnv();
      server.middlewares.use(async (request: IncomingMessage, response: ServerResponse, next: () => void) => {
        const route = apiRouteFromRequest(request);
        if (!route) {
          next();
          return;
        }

        try {
          const mod = await server.ssrLoadModule(`/api/${route}.ts`);
          const handler = mod.default;
          if (typeof handler !== "function") {
            next();
            return;
          }
          await handler(request, response);
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          response.statusCode = 500;
          response.setHeader("content-type", "application/json");
          response.end(JSON.stringify({
            error: error instanceof Error ? error.message : "Unexpected local API error",
          }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [localApiPlugin(), react()],
});
