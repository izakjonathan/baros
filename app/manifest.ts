import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bar Ops",
    short_name: "Bar Ops",
    description: "Handbook, tasks, reminders and daily cash counts for bar teams.",
    start_url: "/operation",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#000000",
    theme_color: "#000000",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [{
      name: "Open Operation",
      short_name: "Operation",
      description: "Open the bar operations workspace",
      url: "/operation",
      icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    }],
  };
}
