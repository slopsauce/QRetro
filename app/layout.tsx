import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

// Dark mode terminal font
const pixelFont = localFont({
  src: "../public/fonts/PixelOperatorMonoHB.ttf",
  variable: "--font-pixel",
  display: "swap",
});

// Light mode typewriter font
const typewriterFont = localFont({
  src: [
    { path: "../public/fonts/TT2020Base-Regular.woff2", weight: "400" },
    { path: "../public/fonts/TT2020Base-Regular.ttf", weight: "400" },
  ],
  variable: "--font-typewriter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QRetro - Retro QR Code Generator",
  description: "Generate QR codes with a nostalgic terminal aesthetic. Create codes for text, URLs, WiFi, and more!",
  keywords: ["qr code", "generator", "retro", "terminal", "free", "online"],
  authors: [{ name: "claude-code" }],
  manifest: process.env.NODE_ENV === 'production' ? "/QRetro/manifest.json" : "/manifest.json",
  openGraph: {
    title: "QRetro - Retro QR Code Generator",
    description: "Generate QR codes with a nostalgic terminal aesthetic",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${pixelFont.variable} ${typewriterFont.variable}`}>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          themes={["light", "dark"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
