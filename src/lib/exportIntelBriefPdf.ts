import { BRAND_LOGO_PATH } from "@/lib/brandLogo";

export type IntelBriefPdfTheme = "light" | "dark";

export function getIntelBriefExportTheme(): IntelBriefPdfTheme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function brandLogoAbsoluteUrl(): string {
  return `${window.location.origin}${BRAND_LOGO_PATH}`;
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = root.querySelectorAll("img");
  await Promise.all(
    [...imgs].map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

/**
 * Renders a branded, theme-matched PDF from live DOM (Tailwind + blocks keep their look).
 * Direct download — no print dialog.
 */
export async function downloadIntelBriefPdf(options: {
  contentElement: HTMLElement;
  /** Main headline under the brand strip */
  documentTitle?: string;
}): Promise<void> {
  const theme = getIntelBriefExportTheme();
  const { contentElement, documentTitle = "Intelligence Brief" } = options;

  const html2pdf = (await import("html2pdf.js")).default;

  const generatedAt = new Date();
  const dateTimeStr = generatedAt.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
  const utcStamp = generatedAt.toISOString().replace("T", " ").slice(0, 19).concat(" UTC");

  const wrapper = document.createElement("div");
  // Keep near full A4 width while forcing mobile-style breakpoints for dense content.
  const pdfContentWidthPx = 740;
  const responsiveViewportWidthPx = 620;
  wrapper.setAttribute("data-pdf-export", "true");
  wrapper.className =
    theme === "dark"
      ? "pdf-export-scope dark bg-background text-foreground antialiased"
      : "pdf-export-scope bg-background text-foreground antialiased";
  wrapper.style.boxSizing = "border-box";
  wrapper.style.width = `${pdfContentWidthPx}px`;
  wrapper.style.maxWidth = `${pdfContentWidthPx}px`;
  wrapper.style.padding = "36px 44px 48px";
  wrapper.style.fontFamily = "'DM Sans', 'Inter', system-ui, sans-serif";
  wrapper.style.borderTop = `4px solid hsl(${theme === "dark" ? "18 100% 49%" : "226 58% 42%"})`;

  const accent = theme === "dark" ? "hsl(226 58% 65%)" : "hsl(226 58% 42%)";
  const muted = theme === "dark" ? "hsl(0 0% 58%)" : "hsl(0 0% 42%)";
  const line = theme === "dark" ? "hsl(0 0% 18%)" : "hsl(40 12% 89%)";
  const headline = theme === "dark" ? "hsl(0 0% 98%)" : "hsl(226 58% 22%)";

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    [data-pdf-export="true"] .pdf-export-blocks { color: hsl(var(--card-foreground)); }
    [data-pdf-export="true"] .pdf-export-blocks * {
      box-sizing: border-box;
      overflow-wrap: anywhere;
      word-break: break-word;
      max-width: 100%;
    }
    [data-pdf-export="true"] .pdf-export-blocks img,
    [data-pdf-export="true"] .pdf-export-blocks svg,
    [data-pdf-export="true"] .pdf-export-blocks canvas,
    [data-pdf-export="true"] .pdf-export-blocks video {
      max-width: 100% !important;
      height: auto !important;
    }
    /* html2canvas renders backdrop-filter poorly — use solid surfaces */
    [data-pdf-export="true"] .glass-panel,
    [data-pdf-export="true"] .glass-panel-strong {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background: hsl(var(--card) / 0.92) !important;
      border-color: hsl(var(--border) / 0.75) !important;
    }
    [data-pdf-export="true"] .pdf-export-blocks table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 12px; }
    [data-pdf-export="true"] .pdf-export-blocks th,
    [data-pdf-export="true"] .pdf-export-blocks td {
      border: 1px solid hsl(var(--border) / 0.65);
      padding: 8px 10px;
      text-align: left;
    }
    [data-pdf-export="true"] .pdf-export-blocks th {
      background: hsl(var(--muted) / 0.45);
      font-weight: 600;
    }
    [data-pdf-export="true"] .pdf-export-blocks a { color: ${accent}; text-decoration: underline; text-underline-offset: 2px; }
    [data-pdf-export="true"] .pdf-export-blocks pre {
      background: hsl(var(--muted) / 0.35) !important;
      border: 1px solid hsl(var(--border) / 0.5) !important;
      white-space: pre-wrap;
    }
    [data-pdf-export="true"] .pdf-export-blocks blockquote {
      border-left-color: hsl(var(--primary) / 0.45) !important;
    }
    [data-pdf-export="true"] .pdf-export-blocks strong,
    [data-pdf-export="true"] .pdf-export-blocks b {
      font-weight: 700 !important;
      color: hsl(var(--foreground)) !important;
    }
  `;
  wrapper.appendChild(styleEl);

  const header = document.createElement("header");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "flex-start";
  header.style.gap = "28px";
  header.style.paddingBottom = "22px";
  header.style.marginBottom = "28px";
  header.style.borderBottom = `2px solid ${theme === "dark" ? "hsl(226 58% 42% / 0.45)" : "hsl(226 58% 42% / 0.35)"}`;

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.gap = "18px";
  left.style.alignItems = "center";

  const logo = document.createElement("img");
  logo.alt = "Infinitygap";
  logo.crossOrigin = "anonymous";
  logo.style.height = "48px";
  logo.style.width = "auto";
  logo.style.objectFit = "contain";
  logo.src = brandLogoAbsoluteUrl();

  const titleBlock = document.createElement("div");
  titleBlock.style.display = "flex";
  titleBlock.style.flexDirection = "column";
  titleBlock.style.gap = "6px";

  const brand = document.createElement("div");
  brand.style.fontSize = "10px";
  brand.style.fontWeight = "800";
  brand.style.letterSpacing = "0.22em";
  brand.style.textTransform = "uppercase";
  brand.style.color = muted;
  brand.textContent = "Infinitygap · infinitygap.onrender.com";

  const h1 = document.createElement("h1");
  h1.style.margin = "0";
  h1.style.fontSize = "24px";
  h1.style.fontWeight = "800";
  h1.style.lineHeight = "1.15";
  h1.style.color = headline;
  h1.style.letterSpacing = "-0.02em";
  h1.textContent = documentTitle;

  const sub = document.createElement("div");
  sub.style.fontSize = "11px";
  sub.style.fontWeight = "700";
  sub.style.color = accent;
  sub.textContent = "Showcase intelligence brief";

  titleBlock.appendChild(brand);
  titleBlock.appendChild(h1);
  titleBlock.appendChild(sub);

  left.appendChild(logo);
  left.appendChild(titleBlock);

  const right = document.createElement("div");
  right.style.textAlign = "right";
  right.style.fontSize = "11px";
  right.style.lineHeight = "1.55";
  right.style.color = muted;
  right.style.maxWidth = "240px";
  right.innerHTML = `<div style="font-weight:700;color:${theme === "dark" ? "hsl(0 0% 88%)" : "hsl(0 0% 22%)"};margin-bottom:4px;">Generated</div><div>${escapeHtml(dateTimeStr)}</div>`;

  header.appendChild(left);
  header.appendChild(right);

  const body = document.createElement("div");
  body.className = "pdf-export-blocks";
  body.style.marginTop = "4px";
  const clone = contentElement.cloneNode(true) as HTMLElement;
  body.appendChild(clone);

  const footer = document.createElement("footer");
  footer.style.marginTop = "40px";
  footer.style.paddingTop = "18px";
  footer.style.borderTop = `1px solid ${line}`;
  footer.style.display = "flex";
  footer.style.justifyContent = "space-between";
  footer.style.alignItems = "center";
  footer.style.gap = "16px";
  footer.style.fontSize = "9px";
  footer.style.color = muted;
  footer.style.flexWrap = "wrap";
  footer.innerHTML = `
    <span style="display:flex;align-items:center;gap:10px;min-width:0;">
      <span style="font-weight:800;color:${accent};letter-spacing:0.04em;">∞ INFINITYGAP</span>
      <span>Confidential · Client use only · Not investment advice</span>
    </span>
    <span style="font-variant-numeric:tabular-nums;white-space:nowrap;">${escapeHtml(utcStamp)}</span>
  `;

  wrapper.appendChild(header);
  wrapper.appendChild(body);
  wrapper.appendChild(footer);

  document.body.appendChild(wrapper);

  try {
    await document.fonts.ready;
    await new Promise<void>((resolve, reject) => {
      logo.onload = () => resolve();
      logo.onerror = () => resolve();
      if (logo.complete) resolve();
    });
    await waitForImages(wrapper);

    const bgCanvas = theme === "dark" ? "#000000" : "#ffffff";

    const filename = `Infinitygap-Intel-Brief-${generatedAt.toISOString().slice(0, 10)}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      enableLinks: true,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: bgCanvas,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: responsiveViewportWidthPx,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
    };

    await html2pdf().set(opt).from(wrapper).save();
  } finally {
    document.body.removeChild(wrapper);
  }
}
