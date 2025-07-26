"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { QRDataType, QR_TYPES, generateQRData } from "@/lib/qr-types";
import { generateQRCode, generateQRCodeSVG, downloadQRCode, downloadQRCodeSVG } from "@/lib/qr-generator";
import { RetroFrame } from "./retro-frame";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "./toast";
import { useHistory, HistoryItem } from "@/hooks/use-history";
import { HistoryPanel } from "./history-panel";
import { useKeyboardShortcuts, useShortcutsHelp, KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";
import { ShortcutsHelp } from "./shortcuts-help";

interface QROptions {
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  width: number;
}

export function QRGenerator() {
  const { theme } = useTheme();
  const { showToast, ToastComponent } = useToast();
  const { addToHistory } = useHistory();
  const { isVisible: showShortcuts, toggleHelp, hideHelp } = useShortcutsHelp();
  const [selectedType, setSelectedType] = useState<QRDataType>("text");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [qrOptions, setQrOptions] = useState<QROptions>({
    errorCorrectionLevel: "M",
    margin: 2,
    width: 400,
  });

  // Debounce form data to prevent excessive QR generation
  const debouncedFormData = useDebounce(formData, 500);
  const debouncedQrOptions = useDebounce(qrOptions, 500);
  const [qrCode, setQrCode] = useState<string>("");
  const [qrSvg, setQrSvg] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  const selectedTypeConfig = QR_TYPES.find(t => t.type === selectedType);

  const generateQR = useCallback(async () => {
    if (!selectedTypeConfig) return;

    // Validate required fields using debounced data
    const missingFields = selectedTypeConfig.fields
      .filter(field => field.required && !debouncedFormData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Required fields: ${missingFields.join(", ")}`);
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const qrData = generateQRData(selectedType, debouncedFormData);
      
      if (!qrData) {
        setError("No data to generate QR code");
        return;
      }

      const colors = theme === "dark" 
        ? { dark: "#00ff00", light: "#000000" }
        : { dark: "#1a1a1a", light: "#f8f8f0" };

      const options = {
        errorCorrectionLevel: debouncedQrOptions.errorCorrectionLevel,
        margin: debouncedQrOptions.margin,
        width: debouncedQrOptions.width,
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
  }, [selectedType, debouncedFormData, selectedTypeConfig, theme, debouncedQrOptions]);

  // Auto-generate when debounced data changes
  useEffect(() => {
    if (Object.values(debouncedFormData).some(value => value.trim())) {
      generateQR();
    }
  }, [debouncedFormData, debouncedQrOptions, generateQR]);

  // Handle theme changes immediately (no debounce for better UX)
  useEffect(() => {
    if (qrCode) {
      generateQR();
    }
  }, [theme, generateQR, qrCode]);

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
      // Auto-save to history before download (no toast)
      handleSaveToHistory(false);
      downloadQRCode(qrCode, `qretro-${selectedType}.png`);
    } else if (format === "svg" && qrSvg) {
      // Auto-save to history before download (no toast)
      handleSaveToHistory(false);
      downloadQRCodeSVG(qrSvg, `qretro-${selectedType}.svg`);
    }
  };

  const handleShare = async () => {
    if (!selectedTypeConfig) return;
    
    // Auto-save to history before sharing (no toast)
    handleSaveToHistory(false);
    
    const qrData = generateQRData(selectedType, formData);
    const basePath = process.env.NODE_ENV === 'production' ? '/QRetro' : '';
    const shareUrl = `${window.location.origin}${basePath}/share#type=${selectedType}&data=${encodeURIComponent(qrData)}`;
    
    // Check if we're in a secure context and clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast("SHARE LINK COPIED!");
        return;
      } catch {
        // Clipboard API failed, fall back to other methods
      }
    }
    
    // Fallback: create a temporary input element to copy text
    try {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        showToast("SHARE LINK COPIED!");
      } else {
        showToast("COPY FAILED - SHARE URL MANUALLY");
      }
    } catch {
      showToast("COPY FAILED - SHARE URL MANUALLY");
    }
  };

  const handleSaveToHistory = (showToastMessage: boolean = true) => {
    if (!selectedTypeConfig || !qrCode) return;
    
    const qrData = generateQRData(selectedType, formData);
    if (!qrData) return;
    
    const historyId = addToHistory(selectedType, formData, qrData, qrOptions);
    
    if (showToastMessage) {
      showToast("QR CODE SAVED TO HISTORY!");
    }
    
    return historyId;
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    // Restore form data and type
    setSelectedType(item.type);
    setFormData(item.data);
    
    // Restore QR options if available
    if (item.qrOptions) {
      setQrOptions(item.qrOptions);
    }
    
    setError("");
    
    // Show feedback to user
    showToast("HISTORY ITEM LOADED!");
    
    // QR will regenerate automatically due to useEffect watching formData
  };

  // Define keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: "s",
      ctrl: true,
      description: "Save QR to history",
      action: () => {
        if (qrCode) {
          handleSaveToHistory();
        }
      },
    },
    {
      key: "d",
      ctrl: true,
      description: "Download PNG",
      action: () => {
        if (qrCode) {
          handleDownload("png");
        }
      },
    },
    {
      key: "e",
      ctrl: true,
      description: "Download SVG",
      action: () => {
        if (qrSvg) {
          handleDownload("svg");
        }
      },
    },
    {
      key: "c",
      ctrl: true,
      description: "Copy share link",
      action: () => {
        if (qrCode) {
          handleShare();
        }
      },
    },
    {
      key: "h",
      ctrl: true,
      description: "Show keyboard shortcuts",
      action: toggleHelp,
    },
    {
      key: "Escape",
      description: "Close shortcuts help",
      action: hideHelp,
    },
  ];

  // Register keyboard shortcuts
  useKeyboardShortcuts(shortcuts);

  return (
    <div className="crt min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow mb-2">
            QRETRO<span className="cursor">█</span>
          </h1>
          <p className="text-muted">RETRO QR CODE GENERATOR v1.0</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  
                  {/* Error Correction Level */}
                  <div className="mt-4 pt-4 border-t border-muted">
                    <label className="block text-sm font-bold mb-2">
                      Error Correction Level
                    </label>
                    <select
                      value={qrOptions.errorCorrectionLevel}
                      onChange={(e) => setQrOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as "L" | "M" | "Q" | "H" }))}
                      className="w-full p-2 bg-background border-2 border-current text-foreground"
                    >
                      <option value="L">L - Low (~7% recovery)</option>
                      <option value="M">M - Medium (~15% recovery)</option>
                      <option value="Q">Q - Quartile (~25% recovery)</option>
                      <option value="H">H - High (~30% recovery)</option>
                    </select>
                    <div className="text-xs text-muted mt-1">
                      Higher levels allow recovery from more damage
                    </div>
                  </div>
                </div>
              </RetroFrame>
            )}
          </div>

          {/* Output Panel */}
          <div className="space-y-4">
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
                    <div className="crt-qr mx-auto mb-4 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode}
                        alt="Generated QR Code"
                        className="border-2 border-current"
                      />
                    </div>
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
                      <div className="relative">
                        <button
                          onClick={handleShare}
                          className="px-3 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-background transition-colors text-sm"
                        >
                          [SHARE]
                        </button>
                        <ToastComponent />
                      </div>
                      <button
                        onClick={() => handleSaveToHistory()}
                        className="px-3 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-background transition-colors text-sm"
                      >
                        [SAVE]
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
            
            {/* History Panel */}
            <HistoryPanel onLoadItem={handleLoadHistoryItem} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-muted space-y-2">
          <p>QRetro - MIT License - Made with 💚 by claude-code</p>
          <button
            onClick={toggleHelp}
            className="text-accent hover:text-foreground transition-colors text-sm"
          >
            [Ctrl+H] Show Keyboard Shortcuts
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Overlay */}
      <ShortcutsHelp 
        shortcuts={shortcuts} 
        isVisible={showShortcuts} 
        onClose={hideHelp} 
      />
    </div>
  );
}