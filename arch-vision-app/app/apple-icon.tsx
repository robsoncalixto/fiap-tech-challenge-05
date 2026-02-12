import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #818CF8 0%, #6366F1 100%)",
          borderRadius: 40,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M16 2L4 7V15C4 22.18 9.12 28.84 16 30C22.88 28.84 28 22.18 28 15V7L16 2Z"
            fill="rgba(255,255,255,0.25)"
          />
          <path
            d="M16 5.5L7 9.5V15.5C7 20.97 10.92 26.04 16 27.2C21.08 26.04 25 20.97 25 15.5V9.5L16 5.5Z"
            fill="rgba(255,255,255,0.15)"
          />
          <path
            d="M11 16.5L14.5 20L21 12.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
