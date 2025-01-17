import { ImageResponse } from "next/og";
import { BsStars } from "react-icons/bs";
export const size = {
  width: 1200,
  height: 630,
};

export async function getOgImage(
  title: string,
  description: string,
  footer: string,
): Promise<ImageResponse> {
  const robotoBold = fetch(
    new URL("https://cdn.jsdelivr.net/gh/wefonts/Roboto/Roboto-Bold.ttf"),
  ).then((res) => res.arrayBuffer());
  const robotoLight = fetch(
    new URL("https://cdn.jsdelivr.net/gh/wefonts/Roboto/Roboto-Light.ttf"),
  ).then((res) => res.arrayBuffer());
  const robotoRegular = fetch(
    new URL("https://cdn.jsdelivr.net/gh/wefonts/Roboto/Roboto-Regular.ttf"),
  ).then((res) => res.arrayBuffer());
  return new ImageResponse(
    (
      <div
        style={{
          padding: "1.5em",
          display: "flex",
          flexDirection: "column",
          background: "#E0FFFF",
          width: "100%",
          height: "100%",
          fontFamily: "Roboto Regular",
        }}
      >
        <div
          style={{ display: "flex", fontFamily: "Roboto Bold", fontSize: 16 }}
        >
          <h2 style={{ color: "gold", margin: 0 }}>{<BsStars />}</h2>
          <h2 style={{ whiteSpace: "nowrap", margin: 0, display: "flex" }}>
            MyWishlists
          </h2>
        </div>

        <div
          style={{
            fontSize: 84,
            width: "100%",
            height: "90%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            margin: 0,
          }}
        >
          <h5 style={{ marginBottom: 0, fontWeight: 900 }}>{title}</h5>
          <p
            style={{
              fontSize: 32,
              marginTop: 0,
              color: "gray",
              fontFamily: "Roboto Regular",
            }}
          >
            {description}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <p style={{ margin: 0, color: "gray", fontSize: 24 }}>{footer}</p>
        </div>
      </div>
    ),
    {
      fonts: [
        {
          name: "Roboto Bold",
          data: await robotoBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Roboto Light",
          data: await robotoLight,
          style: "normal",
          weight: 300,
        },
        {
          name: "Roboto Regular",
          data: await robotoRegular,
          style: "normal",
          weight: 400,
        },
      ],
      ...size,
    },
  );
}
