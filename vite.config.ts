import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
  return {
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["infinitygap.onrender.com", "intelgoldmine.onrender.com", ".onrender.com"],
    hmr: {
      overlay: false,
    },
    // Dev-only: same-origin proxy so Edge Function calls avoid browser CORS preflight to *.supabase.co.
    ...(supabaseUrl
      ? {
          proxy: {
            "/supabase-functions": {
              target: supabaseUrl,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/supabase-functions/, ""),
            },
          },
        }
      : {}),
  },
  preview: {
    host: "::",
    port: 10000,
    allowedHosts: ["infinitygap.onrender.com", "intelgoldmine.onrender.com", ".onrender.com"],
    ...(supabaseUrl
      ? {
          proxy: {
            "/supabase-functions": {
              target: supabaseUrl,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/supabase-functions/, ""),
            },
          },
        }
      : {}),
  },
  plugins: [react(), googleSiteVerificationPlugin(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});
