import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/site";

export const alt = "imgblue — drop an image, get a permanent link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #04070f 0%, #07122a 55%, #0b1f44 100%)",
          color: "#e5efff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 999,
            background: "rgba(56, 132, 255, 0.18)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #38bdf8, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            ib
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>imgblue</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: -2.5,
              lineHeight: 1.04,
            }}
          >
            <span>Drop an image.</span>
            <span>Get a link. Move on.</span>
          </div>
          <div style={{ fontSize: 26, color: "#a3c2ee" }}>
            Free image hosting · JPEG optimized · permanent links
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#7d9fd8",
          }}
        >
          <span>{siteUrl.replace(/^https?:\/\//, "")}</span>
          <span>4 MB · Markdown · HTML · API</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
