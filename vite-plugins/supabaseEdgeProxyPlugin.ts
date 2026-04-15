import https from "node:https";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

const PREFIX = "/supabase-functions";

const DROP_REQ = new Set([
  "connection",
  "keep-alive",
  "proxy-connection",
  "transfer-encoding",
  "upgrade",
  "host",
]);

type NextFn = (err?: unknown) => void;

function forward(
  supabaseOrigin: string,
  clientReq: IncomingMessage,
  clientRes: ServerResponse,
  next: NextFn,
) {
  const raw = clientReq.url || "";
  if (!raw.startsWith(PREFIX)) {
    next();
    return;
  }

  const rest = raw.slice(PREFIX.length) || "/";
  let dest: URL;
  try {
    dest = new URL(rest.startsWith("/") ? rest : `/${rest}`, `${supabaseOrigin.replace(/\/$/, "")}/`);
  } catch {
    next();
    return;
  }

  if (dest.protocol !== "https:") {
    next();
    return;
  }

  const headers: NodeJS.Dict<string | string[]> = {};
  for (const [k, v] of Object.entries(clientReq.headers)) {
    const key = k.toLowerCase();
    if (DROP_REQ.has(key) || v === undefined) continue;
    headers[k] = v;
  }
  headers.host = dest.host;

  const opts: https.RequestOptions = {
    hostname: dest.hostname,
    port: 443,
    path: dest.pathname + dest.search,
    method: clientReq.method,
    headers,
    rejectUnauthorized: true,
  };

  const proxyReq = https.request(opts, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(clientRes);
  });

  proxyReq.on("error", (err) => {
    if (!clientRes.headersSent) {
      clientRes.statusCode = 502;
      clientRes.setHeader("Content-Type", "application/json");
      clientRes.end(JSON.stringify({ error: "Proxy error", detail: String(err?.message || err) }));
    } else {
      clientRes.destroy();
    }
  });

  clientReq.pipe(proxyReq);
}

/** Same-origin proxy for Edge Functions in dev/preview (avoids browser CORS to *.supabase.co). */
export function supabaseEdgeProxyPlugin(supabaseOrigin: string): Plugin {
  const origin = supabaseOrigin.trim().replace(/\/+$/, "");
  const enabled = origin.startsWith("https://");

  const middleware = (req: IncomingMessage, res: ServerResponse, next: NextFn) => {
    if (!enabled) {
      next();
      return;
    }
    forward(origin, req, res, next);
  };

  return {
    name: "supabase-edge-functions-proxy",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      if (!enabled) return;
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      if (!enabled) return;
      server.middlewares.use(middleware);
    },
  };
}
