import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Rhockstar Connect";
    const subtitle = searchParams.get("subtitle") || "The Premier Professional & Community Platform";
    const type = searchParams.get("type") || "Community";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#020617",
            backgroundImage: "radial-gradient(circle at 25px 25px, rgba(139, 92, 246, 0.2) 2%, transparent 0%)",
            backgroundSize: "50px 50px",
            padding: "60px",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Logo Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "rgba(139, 92, 246, 0.2)",
              border: "1px solid rgba(139, 92, 246, 0.4)",
              borderRadius: "50px",
              padding: "10px 24px",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#c084fc",
            }}
          >
            <span>🚀 Rhockstar Connect</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>{type}</span>
          </div>

          {/* Title & Description */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "26px",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Footer Callout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              fontSize: "20px",
              color: "#64748b",
            }}
          >
            <span>rhockstarconnect.com</span>
            <span style={{ color: "#a855f7", fontWeight: "bold" }}>Connect • Hire • Grow</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Failed to generate OG Image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
