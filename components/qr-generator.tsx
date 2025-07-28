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
import { CacheStatus } from "./cache-status";

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
  const [statusMessage, setStatusMessage] = useState<string>("");

  const selectedTypeConfig = QR_TYPES.find(t => t.type === selectedType);

  const generateQR = useCallback(async () => {
    if (!selectedTypeConfig) return;

    // Validate required fields using debounced data
    const missingFields = selectedTypeConfig.fields
      .filter(field => field.required && !debouncedFormData[field.name])
      .map(field => field.label);

    if (missingFields.length > 0) {
      setError(`Required fields: ${missingFields.join(", ")}`);
      setStatusMessage("");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStatusMessage("Generating QR code...");

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
      setStatusMessage("QR code generated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate QR code";
      setError(errorMsg);
      setStatusMessage("");
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
    setStatusMessage("");
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
        const offlineNote = !navigator.onLine ? " (WORKS OFFLINE)" : "";
        showToast(`SHARE LINK COPIED!${offlineNote}`);
        
        // Cache the QR code for offline access via service worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_QR_CODE',
            qrData: {
              id: `${selectedType}-${Date.now()}`,
              dataUrl: qrCode,
              type: selectedType,
              data: formData
            }
          });
        }
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
        const offlineNote = !navigator.onLine ? " (WORKS OFFLINE)" : "";
        showToast(`SHARE LINK COPIED!${offlineNote}`);
      } else {
        showToast("COPY FAILED - QR SAVED TO HISTORY");
      }
    } catch {
      showToast("COPY FAILED - QR SAVED TO HISTORY");
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
    <div className="crt min-h-screen p-6 flex flex-col">
      {/* Status Announcements - Screen reader only */}
      <div className="sr-only">
        {statusMessage && (
          <div role="status" aria-live="polite">
            {statusMessage}
          </div>
        )}
        {error && (
          <div role="alert" aria-live="assertive">
            {error}
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto flex-1 w-full">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold glow mb-2">
            QRETRO<span className="cursor">█</span>
          </h1>
          <p className="text-muted">RETRO QR CODE GENERATOR</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-4">
            {/* Type Selection */}
            <RetroFrame title="SELECT TYPE">
              <div 
                role="radiogroup" 
                aria-labelledby="type-selection-heading"
                className="grid grid-cols-2 gap-2"
              >
                <span id="type-selection-heading" className="sr-only">
                  Select QR code type
                </span>
                {QR_TYPES.map((type) => (
                  <button
                    key={type.type}
                    role="radio"
                    aria-checked={selectedType === type.type}
                    aria-describedby={`${type.type}-description`}
                    onClick={() => handleTypeChange(type.type)}
                    className={cn(
                      "p-3 border-2 text-left transition-colors",
                      selectedType === type.type
                        ? "border-accent bg-accent text-background"
                        : "border-current hover:border-accent"
                    )}
                  >
                    <div className="font-bold">{type.icon} {type.label}</div>
                    <div id={`${type.type}-description`} className="text-sm text-muted">
                      {type.description}
                    </div>
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
                      <label 
                        htmlFor={`input-${field.name}`}
                        className="block text-sm font-bold mb-1"
                      >
                        {field.label}
                        {field.required && <span className="text-accent" aria-label="required">*</span>}
                      </label>
                      {field.placeholder && (
                        <div id={`${field.name}-help`} className="sr-only">
                          {field.placeholder}
                        </div>
                      )}
                      {field.type === "select" ? (
                        <select
                          id={`input-${field.name}`}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          aria-required={field.required}
                          aria-invalid={error && !formData[field.name] && field.required ? "true" : "false"}
                          aria-describedby={field.placeholder ? `${field.name}-help` : undefined}
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
                          id={`input-${field.name}`}
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          aria-required={field.required}
                          aria-invalid={error && !formData[field.name] && field.required ? "true" : "false"}
                          aria-describedby={field.placeholder ? `${field.name}-help` : undefined}
                          className="w-full p-2 bg-background border-2 border-current text-foreground placeholder:text-muted"
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Error Correction Level */}
                  <div className="mt-4 pt-4 border-t border-muted">
                    <label 
                      htmlFor="error-correction-level"
                      className="block text-sm font-bold mb-2"
                    >
                      Error Correction Level
                    </label>
                    <select
                      id="error-correction-level"
                      value={qrOptions.errorCorrectionLevel}
                      onChange={(e) => setQrOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as "L" | "M" | "Q" | "H" }))}
                      aria-describedby="error-correction-help"
                      className="w-full p-2 bg-background border-2 border-current text-foreground"
                    >
                      <option value="L">L - Low (~7% recovery)</option>
                      <option value="M">M - Medium (~15% recovery)</option>
                      <option value="Q">Q - Quartile (~25% recovery)</option>
                      <option value="H">H - High (~30% recovery)</option>
                    </select>
                    <div id="error-correction-help" className="text-xs text-muted mt-1">
                      Higher levels allow recovery from more damage but create larger QR codes
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
                    <div className="text-accent" role="status" aria-live="polite">
                      GENERATING QR CODE...
                    </div>
                    <div className="mt-2">
                      <span className="cursor">█</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="py-20 text-accent" role="alert" aria-live="assertive">
                    ERROR: {error}
                  </div>
                ) : qrCode ? (
                  <div>
                    <div className="crt-qr mx-auto mb-4 inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCode}
                        alt={`Generated QR Code for ${selectedTypeConfig?.label || selectedType}`}
                        className="border-2 border-current"
                      />
                    </div>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <button
                        onClick={() => handleDownload("png")}
                        aria-label={`Download QR code as PNG image for ${selectedTypeConfig?.label || selectedType}`}
                        className="px-3 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors text-sm"
                      >
                        [PNG]
                      </button>
                      <button
                        onClick={() => handleDownload("svg")}
                        aria-label={`Download QR code as SVG vector for ${selectedTypeConfig?.label || selectedType}`}
                        className="px-3 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors text-sm"
                      >
                        [SVG]
                      </button>
                      <div className="relative">
                        <button
                          onClick={handleShare}
                          aria-label={`Copy share link for ${selectedTypeConfig?.label || selectedType} QR code`}
                          className="px-3 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-background transition-colors text-sm"
                        >
                          [SHARE]
                        </button>
                        <ToastComponent />
                      </div>
                      <button
                        onClick={() => handleSaveToHistory()}
                        aria-label={`Save ${selectedTypeConfig?.label || selectedType} QR code to local history`}
                        className="px-3 py-2 border-2 border-secondary text-secondary hover:bg-secondary hover:text-background transition-colors text-sm"
                      >
                        [SAVE]
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-muted" role="status" aria-live="polite">
                    Enter data to generate QR code
                  </div>
                )}
              </div>
            </RetroFrame>
            
            {/* History Panel */}
            <HistoryPanel onLoadItem={handleLoadHistoryItem} />
          </div>
        </div>
      </main>

      {/* Footer - Outside flex-1 container */}
      <footer className="mt-12 max-w-7xl mx-auto w-full">
        {/* Cache Info - Collapsed by default */}
        <div className="text-center mb-4 relative">
          <details className="group">
            <summary className="text-xs text-muted/70 hover:text-muted cursor-pointer list-none">
              <span className="group-open:hidden">▸ Cache Info</span>
              <span className="hidden group-open:inline">▴ Cache Info</span>
            </summary>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-background border border-muted/20 rounded px-3 py-2 shadow-lg z-10 hidden group-open:block">
              <CacheStatus />
            </div>
          </details>
        </div>

        {/* Features */}
        <div className="text-center text-muted/80 mb-2">
          <p className="text-xs">
            📱 Works offline • 💾 Local storage • 🔒 Privacy-first
          </p>
        </div>

        {/* Primary Attribution */}
        <div className="text-center text-muted">
          <p className="text-sm">
            Press Ctrl+H for shortcuts • Made with 💚 by claude-code
            {" • "}
            <a 
              href="https://github.com/slopsauce/QRetro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-current hover:text-yellow-400 transition-colors inline-flex items-center"
              title="View on GitHub"
            >
              <svg 
                className="w-3 h-3" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                aria-label="GitHub"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </p>
        </div>
      </footer>

      {/* Keyboard Shortcuts Help Overlay */}
      <ShortcutsHelp 
        shortcuts={shortcuts} 
        isVisible={showShortcuts} 
        onClose={hideHelp} 
      />
    </div>
  );
}