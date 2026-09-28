import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { tools } from "@/lib/tools";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: "", priority: 1 }, ...tools.map((t) => ({ path: `/${t.slug}`, priority: 0.8 })),
    { path: "/about", priority: 0.3 }, { path: "/privacy", priority: 0.3 }, { path: "/terms", priority: 0.2 }, { path: "/contact", priority: 0.3 },
  ];
  return pages.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: now, changeFrequency: "monthly", priority: p.priority }));
}
