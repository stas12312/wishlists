import { ImageResponse } from "next/og";
import { BsStars } from "react-icons/bs";

// Image metadata
export const size = {
  width: 144,
  height: 144,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 140,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <BsStars style={{ color: "gold" }} />
      </div>
    ),
    {
      ...size,
    },
  );
}
