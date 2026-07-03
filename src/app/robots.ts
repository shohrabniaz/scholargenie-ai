import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scholargenie-ai.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/countries", "/countries/"],
      disallow: [
        "/dashboard",
        "/scholarships",
        "/universities",
        "/professors",
        "/advisor",
        "/deadlines",
        "/applications",
        "/tools",
        "/onboarding",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
