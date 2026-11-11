export const site = {
  name: "imgblue",
  tagline: "Images in. Links out.",
  description:
    "A tiny image hosting API. Upload an image, get a permanent link. JPEG-optimized, stored as base64 rows in Turso, served from Vercel.",
  repo: "https://github.com/am3lue/imgblue",
  defaultBaseUrl: "https://imgblue.vercel.app",
};

const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim();

export const siteUrl = (configuredBaseUrl || site.defaultBaseUrl).replace(/\/+$/, "");
