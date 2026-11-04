import { ImageResponse } from "next/og";
import { BsStars } from "react-icons/bs";
import sharp from "sharp";

import { WISHLIST_OG_COLORS } from "./wishlist/wishlistAppearance";

export const size = {
  width: 1200,
  height: 630,
};

export type OgTheme = "light" | "dark";

interface OgImageOptions {
  avatar?: string;
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
  { avatar, color = "sky", emoji, theme = "light" }: OgImageOptions = {},
): Promise<ImageResponse> {
  let avatarData: string | undefined;
  if (avatar && footer) {
    try {
      const url = new URL(avatar);
      const allowedOrigins = [
        process.env.S3_DOMAIN,
        process.env.NEXT_PUBLIC_STATIC_URL,
        "https://avatars.yandex.net",
      ].filter(Boolean);
      if (allowedOrigins.includes(url.origin)) {
        const response = await fetch(url, {
          redirect: "error",
          signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
          const image = await sharp(await response.arrayBuffer(), {
            limitInputPixels: 16000000,
          })
            .resize(112, 112, { fit: "cover" })
            .composite([
              {
                input: Buffer.from(
                  '<svg width="112" height="112"><circle cx="56" cy="56" r="56" fill="white"/></svg>',
                ),
                blend: "dest-in",
              },
            ])
            .png()
            .toBuffer();
          avatarData = `data:image/png;base64,${image.toString("base64")}`;
        }
      }
    } catch {
      // Render only the name when the photo is unavailable or invalid.
    }
  }
  const accent =
    WISHLIST_OG_COLORS[color as keyof typeof WISHLIST_OG_COLORS] ??
    WISHLIST_OG_COLORS.sky;
  const palette = { ...palettes[theme], ...accent[theme] };
  const pattern = [
    { left: 32, top: 166, size: 144, rotation: -18 },
    { left: 344, top: 32, size: 100, rotation: 16 },
    { left: 988, top: 34, size: 160, rotation: -18 },
    { left: 1052, top: 300, size: 104, rotation: 16 },
    { left: 44, top: 438, size: 140, rotation: 14 },
    { left: 846, top: 444, size: 136, rotation: -20 },
  ];
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
          background: theme === "dark" ? palette.background : "#FDFBFF",
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
            opacity: theme === "dark" ? 0.32 : 0.24,
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
                width: position.size,
                height: position.size,
                fontSize: position.size * 0.85,
                lineHeight: 1,
                transform: `rotate(${position.rotation}deg)`,
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
            backgroundImage: `radial-gradient(ellipse at center, ${theme === "dark" ? "rgba(2, 6, 23, 0.35)" : "rgba(253, 251, 255, 0.98)"} 20%, ${theme === "dark" ? "rgba(2, 6, 23, 0)" : "rgba(253, 251, 255, 0)"} 72%, ${palette.edge} 100%)`,
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
                      lineClamp: 2,
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
              alignItems: "center",
              gap: 12,
              color: palette.secondary,
              fontSize: 24,
            }}
          >
            {avatarData ? (
              <div
                style={{
                  display: "flex",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  background: palette.emojiBackground,
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="" height={56} src={avatarData} width={56} />
              </div>
            ) : null}
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
