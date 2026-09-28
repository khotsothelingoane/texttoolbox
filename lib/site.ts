import type { Metadata } from "next";
export const SITE_NAME = "TextToolbox";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const TAGLINE = "Free Online Text Tools";
export const SUPPORT = "Clean, transform, analyze and format text instantly — free, with no signup required.";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const ADSENSE = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

export function pageMeta(o: { title: string; description: string; path: string }): Metadata {
  const url = `${SITE_URL}${o.path}`;
  return {
    title: { absolute: o.title },
    description: o.description,
    alternates: { canonical: url },
    openGraph: { title: o.title, description: o.description, url, siteName: SITE_NAME, type: "website", locale: "en" },
    twitter: { card: "summary_large_image", title: o.title, description: o.description },
  };
}
