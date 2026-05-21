import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yalla Wassel — accountability without surveillance",
  description:
    "Same-day delivery in Amman, built around intentional checkpoints, mutual trust scores, and an explainable dispatch engine — not GPS tracking.",
  openGraph: {
    title: "Yalla Wassel",
    description:
      "Accountability without surveillance. Trust without micromanagement.",
  },
  icons: {
    icon: "/logo-mark.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // driver UI: prevents accidental zoom on big buttons
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
