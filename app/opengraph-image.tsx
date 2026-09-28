import { ImageResponse } from "next/og";
export const alt = "TextToolbox – Free Online Text Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#0a5c8a", color: "#fff" }}>
        <div style={{ fontSize: 96, fontWeight: 800 }}>TextToolbox</div>
        <div style={{ fontSize: 44, marginTop: 24 }}>Free online text tools. No signup.</div>
        <div style={{ fontSize: 32, marginTop: 16, opacity: 0.85 }}>Runs in your browser.</div>
      </div>
    ),
    size,
  );
}
