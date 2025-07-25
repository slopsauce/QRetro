import QRCode from "qrcode";

export interface QRGeneratorOptions {
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  width?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  data: string,
  options: QRGeneratorOptions = {}
): Promise<string> {
  const defaultOptions: QRGeneratorOptions = {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      margin: finalOptions.margin,
      width: finalOptions.width,
      color: finalOptions.color,
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

export async function generateQRCodeSVG(
  data: string,
  options: QRGeneratorOptions = {}
): Promise<string> {
  const defaultOptions: QRGeneratorOptions = {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      errorCorrectionLevel: finalOptions.errorCorrectionLevel,
      margin: finalOptions.margin,
      width: finalOptions.width,
      color: finalOptions.color,
    });
    return svg;
  } catch (error) {
    console.error("Error generating QR code SVG:", error);
    throw new Error("Failed to generate QR code");
  }
}

export function downloadQRCode(dataUrl: string, filename: string = "qrcode.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function downloadQRCodeSVG(svg: string, filename: string = "qrcode.svg") {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}