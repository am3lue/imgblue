import type { ImageMeta } from "./images";
import { site, siteUrl } from "./site";

const ORGANIZATION_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: site.name,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [site.repo],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteUrl,
        name: site.name,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        name: site.name,
        url: siteUrl,
        description: site.description,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        isPartOf: { "@id": WEBSITE_ID },
      },
    ],
  };
}

export function imageJsonLd(image: ImageMeta, shareUrl: string, directUrl: string) {
  const name = image.original_name ?? `Image ${image.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${shareUrl}#image`,
    url: shareUrl,
    contentUrl: directUrl,
    thumbnailUrl: directUrl,
    name,
    description: `${name} — a ${image.width}×${image.height} image hosted on imgblue.`,
    width: image.width,
    height: image.height,
    encodingFormat: image.mime_type,
    contentSize: `${image.size_bytes} B`,
    datePublished: image.created_at,
    uploadDate: image.created_at,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: siteUrl,
    },
  };
}
