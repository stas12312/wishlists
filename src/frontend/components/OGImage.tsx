import { ImageResponse } from "next/og";
import { BsStars } from "react-icons/bs";

import { WISHLIST_OG_COLORS } from "./wishlist/wishlistAppearance";

export const size = {
  width: 1200,
  height: 630,
};

export type OgTheme = "light" | "dark";

interface OgImageOptions {
  color?: string;
  emoji?: string;
  theme?: OgTheme;
}

const palettes = {
  light: {
    foreground: "#172033",
    secondary: "#334155",
  },
  dark: {
    foreground: "#F8FAFC",
    secondary: "#A8B3C5",
  },
};

export async function getOgImage(
  title: string,
  description: string,
  footer: string,
  { color = "sky", emoji, theme = "light" }: OgImageOptions = {},
): Promise<ImageResponse> {
  const accent =
    WISHLIST_OG_COLORS[color as keyof typeof WISHLIST_OG_COLORS] ??
    WISHLIST_OG_COLORS.sky;
  const palette = { ...palettes[theme], ...accent[theme] };
  const angle = Math.PI / 4;
  const pattern: { left: number; top: number }[] = [];
  for (let row = -15; row <= 15; row++) {
    for (let column = -15; column <= 15; column++) {
      const x = column * 120;
      const y = row * 120;
      const left = 600 + x * Math.cos(angle) - y * Math.sin(angle) - 45;
      const top = 315 + x * Math.sin(angle) + y * Math.cos(angle) - 45;
      if (left > -90 && left < 1200 && top > -90 && top < 630) {
        pattern.push({ left, top });
      }
    }
  }
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
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: palette.background,
          color: palette.foreground,
          width: "100%",
          height: "100%",
          fontFamily: "Roboto Regular",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            opacity: theme === "dark" ? 0.75 : 0.4,
          }}
        >
          {pattern.map((position, index) => (
            <span
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                left: position.left,
                top: position.top,
                width: 90,
                height: 90,
                fontSize: 76,
                lineHeight: 1,
                transform: "rotate(45deg)",
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
        {theme === "dark" ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              background: "rgba(2, 6, 23, 0.55)",
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundImage: `radial-gradient(circle at center, rgba(2, 6, 23, 0) 35%, rgba(2, 6, 23, 0) 48%, ${palette.edge} 100%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "36px 48px",
          }}
        >
          <div
            style={{ display: "flex", fontFamily: "Roboto Bold", fontSize: 20 }}
          >
            <h2 style={{ color: "gold", margin: 0 }}>{<BsStars />}</h2>
            <h2 style={{ whiteSpace: "nowrap", margin: 0, display: "flex" }}>
              MyWishlists
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              position: "relative",
              flex: 1,
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: "50%",
                right: 0,
                left: 0,
                justifyContent: "center",
                transform: "translateY(-50%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  position: "relative",
                  maxWidth: 1000,
                  justifyContent: "center",
                  fontFamily: "Roboto Bold",
                  fontSize: title.length > 42 ? 56 : 76,
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
              >
                <div style={{ display: "block", lineClamp: 3 }}>{title}</div>
                {description ? (
                  <div
                    style={{
                      display: "block",
                      lineClamp: 3,
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      width: 960,
                      justifyContent: "center",
                      marginTop: 20,
                      transform: "translateX(-50%)",
                      color: palette.secondary,
                      fontFamily: "Roboto Regular",
                      fontSize: 30,
                      fontWeight: 400,
                      lineHeight: 1.3,
                    }}
                  >
                    {description}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              color: palette.secondary,
              fontSize: 24,
            }}
          >
            {footer}
          </div>
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
