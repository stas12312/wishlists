import { ImageResponse } from "next/og";
import { BsStars } from "react-icons/bs";

export const size = {
  width: 144,
  height: 144,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 136,
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
