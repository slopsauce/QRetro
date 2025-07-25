"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { QRDataType, QR_TYPES, generateQRData } from "@/lib/qr-types";
import { generateQRCode, generateQRCodeSVG, downloadQRCode, downloadQRCodeSVG } from "@/lib/qr-generator";
import { RetroFrame } from "./retro-frame";
import { QROptionsPanel, QROptions } from "./qr-options";
import { cn } from "@/lib/utils";

export function QRGenerator() {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<QRDataType>("text");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [qrOptions, setQrOptions] = useState<QROptions>({
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
  });
  const [qrCode, setQrCode] = useState<string>("");
  const [qrSvg, setQrSvg] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedTypeConfig = QR_TYPES.find(t => t.type === selectedType);

  const generateQR = useCallback(async () => {
    if (!selectedTypeConfig) return;

    // Validate required fields
    const missingFields = selectedTypeConfig.fields
      .filter(field => field.required && !formData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const qrData = generateQRData(selectedType, formData);
      
      if (!qrData) {
        setError("No data to generate QR code");
        return;
      }

      const colors = theme === "dark" 
        ? { dark: "#00ff00", light: "#000000" }
        : { dark: "#1a1a1a", light: "#f8f8f0" };

      const options = {
        ...qrOptions,
        color: colors
      };

      const [pngDataUrl, svg] = await Promise.all([
        generateQRCode(qrData, options),
        generateQRCodeSVG(qrData, options)
      ]);

      setQrCode(pngDataUrl);
      setQrSvg(svg);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedType, formData, selectedTypeConfig, theme, qrOptions]);

  // Auto-generate when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formData).some(value => value.trim())) {
        generateQR();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, qrOptions, generateQR]);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (type: QRDataType) => {
    setSelectedType(type);
    setFormData({});
    setQrCode("");
    setQrSvg("");
    setError("");
  };

  const handleDownload = (format: "png" | "svg") => {
    if (format === "png" && qrCode) {
      downloadQRCode(qrCode, `qretro-${selectedType}.png`);
    } else if (format === "svg" && qrSvg) {
      downloadQRCodeSVG(qrSvg, `qretro-${selectedType}.svg`);
    }
  };

  const handleShare = async () => {
    if (!selectedTypeConfig) return;
    
    const qrData = generateQRData(selectedType, formData);
    const shareUrl = `${window.location.origin}/share?type=${selectedType}&data=${encodeURIComponent(qrData)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard!");
    } catch {
      // Fallback for browsers that don't support clipboard API
      prompt("Copy this link to share:", shareUrl);
    }
  };

  return (
    <div className="crt min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow mb-2">QRETRO</h1>
          <p className="text-muted">RETRO QR CODE GENERATOR v1.0</p>
          <div className="flex justify-center mt-4">
            <span className="cursor">█</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Type Selection */}
            <RetroFrame title="SELECT TYPE">
              <div className="grid grid-cols-2 gap-2">
                {QR_TYPES.map((type) => (
                  <button
                    key={type.type}
                    onClick={() => handleTypeChange(type.type)}
                    className={cn(
                      "p-3 border-2 text-left transition-colors",
                      selectedType === type.type
                        ? "border-accent bg-accent text-background"
                        : "border-current hover:border-accent"
                    )}
                  >
                    <div className="font-bold">{type.icon} {type.label}</div>
                    <div className="text-sm text-muted">{type.description}</div>
                  </button>
                ))}
              </div>
            </RetroFrame>

            {/* Input Fields */}
            {selectedTypeConfig && (
              <RetroFrame title="INPUT DATA">
                <div className="space-y-4">
                  {selectedTypeConfig.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-bold mb-1">
                        {field.label}
                        {field.required && <span className="text-accent">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full p-2 bg-background border-2 border-current text-foreground"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full p-2 bg-background border-2 border-current text-foreground placeholder:text-muted"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </RetroFrame>
            )}
          </div>

          {/* QR Options Panel */}
          <div>
            <QROptionsPanel 
              options={qrOptions} 
              onChange={setQrOptions} 
            />
          </div>

          {/* Output Panel */}
          <div>
            <RetroFrame title="QR CODE OUTPUT">
              <div className="text-center">
                {isGenerating ? (
                  <div className="py-20">
                    <div className="text-accent">GENERATING QR CODE...</div>
                    <div className="mt-2">
                      <span className="cursor">█</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-20 text-accent">
                    ERROR: {error}
                  </div>
                ) : qrCode ? (
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCode}
                      alt="Generated QR Code"
                      className="mx-auto mb-4 border-2 border-current"
                    />
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => handleDownload("png")}
                        className="px-3 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors text-sm"
                      >
                        [PNG]
                      </button>
                      <button
                        onClick={() => handleDownload("svg")}
                        className="px-3 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors text-sm"
                      >
                        [SVG]
                      </button>
                      <button
                        onClick={handleShare}
                        className="px-3 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-background transition-colors text-sm"
                      >
                        [SHARE]
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-muted">
                    Enter data to generate QR code
                  </div>
                )}
              </div>
            </RetroFrame>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted">
          <p>QRetro - MIT License - Made with 💚 by slopsauce</p>
        </div>
      </div>
    </div>
  );
}