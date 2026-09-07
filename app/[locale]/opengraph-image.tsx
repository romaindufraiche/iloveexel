import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = "SheetInsight — votre fichier Excel transformé en rapport d'analyse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card people see when the site is shared on LinkedIn, Slack, WhatsApp
// or X. Kept to plain flexbox and system fonts, which is all Satori (the
// renderer behind ImageResponse) needs — no font files to ship. Sizes are
// deliberately conservative: Satori's text metrics run larger than a
// browser's, and anything past 630px tall is silently cropped.
export default function OpengraphImage() {
  const bars = [
    { height: 74, color: "#22c07a" },
    { height: 116, color: "#0fa968" },
    { height: 56, color: "#22c07a" },
    { height: 140, color: "#0a8a54" },
    { height: 96, color: "#0a6f45" },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#0a8a54",
              color: "#ffffff",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: "32px", fontWeight: 700, color: "#111827" }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "58px", fontWeight: 800, color: "#111827" }}>Votre fichier Excel en</div>
          <div style={{ display: "flex", fontSize: "58px", fontWeight: 800, color: "#0a8a54", marginTop: "6px" }}>
            rapport d&apos;analyse
          </div>
          <div style={{ display: "flex", fontSize: "26px", color: "#4b5563", marginTop: "18px" }}>
            Les bons graphiques choisis pour vous, en PDF ou PowerPoint.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", height: "140px" }}>
            {bars.map((bar, i) => (
              <div key={i} style={{ display: "flex", width: "62px", height: `${bar.height}px`, backgroundColor: bar.color, borderRadius: "10px" }} />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              fontWeight: 600,
              color: "#0a6f45",
              backgroundColor: "#d6f9e2",
              padding: "14px 28px",
              borderRadius: "999px",
            }}
          >
            Gratuit, sans inscription
          </div>
        </div>
      </div>
    ),
    size
  );
}
