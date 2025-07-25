import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "QRetro - Retro QR Code Generator",
  description: "Generate QR codes with a nostalgic terminal aesthetic. Create codes for text, URLs, WiFi, and more!",
  keywords: ["qr code", "generator", "retro", "terminal", "free", "online"],
  authors: [{ name: "slopsauce" }],
  manifest: "/manifest.json",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${vt323.variable} font-mono antialiased`}
      >
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
