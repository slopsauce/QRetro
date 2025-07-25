import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-source-code-pro",
});

export const metadata: Metadata = {
  title: "QRetro - Retro QR Code Generator",
  description: "Generate QR codes with a nostalgic terminal aesthetic. Create codes for text, URLs, WiFi, and more!",
  keywords: ["qr code", "generator", "retro", "terminal", "free", "online"],
  authors: [{ name: "slopsauce" }],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceCodePro.variable} font-mono antialiased`}
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
