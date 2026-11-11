import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "imgblue — free image hosting",
    short_name: "imgblue",
    description:
      "Upload an image and get a permanent link. Free image hosting for screenshots, docs, and side projects.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#04070f",
    theme_color: "#04070f",
    lang: "en",
    categories: ["developer", "multimedia", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
