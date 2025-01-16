import { ImageResponse } from "next/og";
import { Inter as FontSans } from "next/font/google";

import { getWishlist } from "@/lib/requests";
export const runtime = "edge";

export const alt = "Вишлист";
export const size = {
  width: 1200,
  height: 630,
};
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const contentType = "image/png";

export default async function Image({ params }: { params: { uuid: string } }) {
  const wishlist = await getWishlist(params.uuid);
  let title;
  let description = "";
  if ("message" in wishlist) {
    title = "Вишлист";
  } else {
    title = wishlist.name;
    description = wishlist.description || "";
  }

  return new ImageResponse(
    (
      <div
        style={{
          padding: "1em",
          display: "flex",
          background: "#E0FFFF",
          width: "100%",
          height: "100%",
        }}
      >
        <h2 style={{ whiteSpace: "nowrap", margin: 0 }}>Мои вишлисты</h2>
        <div
          style={{
            fontSize: 64,

            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <h5 style={{ marginBottom: 0 }}>{title}</h5>
          <p style={{ fontSize: 32, marginTop: 0 }}>{description}</p>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
