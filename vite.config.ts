import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { supabaseEdgeProxyPlugin } from "./vite-plugins/supabaseEdgeProxyPlugin";

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function googleSiteVerificationPlugin(mode: string): Plugin {
  return {
    name: "google-site-verification",
    transformIndexHtml(html) {
      if (/name=["']google-site-verification["']/.test(html)) return html;
      const env = loadEnv(mode, process.cwd(), "");
      const token =
        env.VITE_GOOGLE_SITE_VERIFICATION?.trim() || env.GOOGLE_SITE_VERIFICATION?.trim();
      if (!token) return html;
      const meta = `    <meta name="google-site-verification" content="${escapeHtmlAttr(token)}" />\n`;
      return html.replace(/<head>/i, `<head>\n${meta}`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = process.cwd();
  // Use VITE_ prefix explicitly so .env is always picked up the same way as the client bundle.
  const viteEnv = loadEnv(mode, envDir, "VITE_");
  const supabaseUrl = (
    viteEnv.VITE_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (mode === "development" && !supabaseUrl) {
    console.warn(
      "[vite] VITE_SUPABASE_URL is missing — the /supabase-functions dev proxy is OFF. Edge calls will 404 on localhost. Add VITE_SUPABASE_URL to .env (see .env.example).",
    );
  }

  return {
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["infinitygap.onrender.com", "intelgoldmine.onrender.com", ".onrender.com"],
    hmr: {
      overlay: false,
    },
  },
  preview: {
    host: "::",
    port: 10000,
    allowedHosts: ["infinitygap.onrender.com", "intelgoldmine.onrender.com", ".onrender.com"],
  },
  plugins: [
    supabaseEdgeProxyPlugin(supabaseUrl),
    react(),
    googleSiteVerificationPlugin(mode),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
