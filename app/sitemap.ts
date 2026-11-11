import type { MetadataRoute } from "next";
import { listImagesForSitemap, type SitemapImage } from "@/lib/images";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let images: SitemapImage[] = [];

  try {
    images = await listImagesForSitemap(500);
  } catch (error) {
    console.error("[imgblue] sitemap images failed:", error);
  }

  const latest = images[0]?.created_at;

  return [
    {
      url: siteUrl,
      lastModified: latest ? new Date(latest) : undefined,
      changeFrequency: "daily",
      priority: 1,
    },
    ...images.map((image) => ({
      url: `${siteUrl}/i/${image.id}`,
      lastModified: image.created_at ? new Date(image.created_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [`${siteUrl}/api/i/${image.id}`],
    })),
  ];
}
