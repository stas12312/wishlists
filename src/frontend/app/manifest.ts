import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "MyWishlists",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon",
        sizes: "144x144",
        type: "image/png",
      },
    ],
    related_applications: [
      {
        platform: "web",
        url: process.env.BASE_URL || "",
      },
    ],
    screenshots: [
      {
        form_factor: "wide",
        label: "Главная страница",
        src: "https://files.mywishlists.ru/static/pc_image.png",
        sizes: "1881x1287",
      },
      {
        form_factor: "narrow",
        label: "Главная страница",
        src: "https://files.mywishlists.ru/static/phone_image.png",
        sizes: "387x838",
      },
    ],
  };
}
