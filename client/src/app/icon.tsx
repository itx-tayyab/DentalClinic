import { ImageResponse } from "next/og";

export const size = {
  width: 192,
  height: 192,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 88,
          background: "#0f766e",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: 44,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        BS
      </div>
    ),
    {
      ...size,
    },
  );
}
