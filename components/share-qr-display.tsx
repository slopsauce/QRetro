"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { generateQRCode } from "@/lib/qr-generator";

interface ShareQRDisplayProps {
  qrData: string;
}

export function ShareQRDisplay({ qrData }: ShareQRDisplayProps) {
  const { theme } = useTheme();
  const [qrCode, setQrCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateQR = async () => {
      if (!qrData) return;
      
      setIsLoading(true);
      try {
        const colors = theme === "dark" 
          ? { dark: "#00ff00", light: "#000000" }
          : { dark: "#1a1a1a", light: "#f8f8f0" };

        const dataUrl = await generateQRCode(qrData, { color: colors });
        setQrCode(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [qrData, theme]);

  if (isLoading) {
    return (
      <div className="py-20">
        <div className="text-accent">GENERATING QR CODE...</div>
        <div className="mt-2">
          <span className="cursor">█</span>
        </div>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="py-20 text-accent">
        ERROR: Failed to generate QR code
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={qrCode}
      alt="Shared QR Code"
      className="mx-auto mb-4 border-2 border-current"
    />
  );
}