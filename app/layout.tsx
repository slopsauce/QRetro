import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/providers";
import { ThemeColor } from "@/components/theme-color";
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
  icons: {
    icon: [
      { url: process.env.NODE_ENV === 'production' ? '/QRetro/icon-192.png' : '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: process.env.NODE_ENV === 'production' ? '/QRetro/icon-512.png' : '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: process.env.NODE_ENV === 'production' ? '/QRetro/icon-180.png' : '/icon-180.png', sizes: '180x180', type: 'image/png' },
  },
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
          <ThemeColor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
