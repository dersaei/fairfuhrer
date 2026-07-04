import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/konto",
        "/login",
        "/register",
        "/passwort-vergessen",
        "/passwort-zuruecksetzen",
        "/callback",
      ],
    },
    host: "https://www.fairfuehrer.guide",
    sitemap: "https://www.fairfuehrer.guide/sitemap.xml",
  };
}
