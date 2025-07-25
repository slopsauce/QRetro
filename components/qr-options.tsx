"use client";

import { RetroFrame } from "./retro-frame";

export interface QROptions {
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  margin: number;
  width: number;
}

interface QROptionsProps {
  options: QROptions;
  onChange: (options: QROptions) => void;
}

export function QROptionsPanel({ options, onChange }: QROptionsProps) {
  const handleChange = (key: keyof QROptions, value: string | number) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <RetroFrame>
      <div className="space-y-4">
        {/* Error Correction Level */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Error Correction Level
          </label>
          <select
            value={options.errorCorrectionLevel}
            onChange={(e) => handleChange("errorCorrectionLevel", e.target.value as "L" | "M" | "Q" | "H")}
            className="w-full p-2 bg-surface border border-muted text-foreground"
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

        {/* QR Code Size */}
        <div>
          <label className="block text-sm font-bold mb-2">
            QR Code Size
          </label>
          <select
            value={options.width}
            onChange={(e) => handleChange("width", parseInt(e.target.value))}
            className="w-full p-2 bg-surface border border-muted text-foreground"
          >
            <option value="200">Small (200px)</option>
            <option value="400">Medium (400px)</option>
            <option value="600">Large (600px)</option>
            <option value="800">X-Large (800px)</option>
          </select>
        </div>

        {/* Margin */}
        <div>
          <label className="block text-sm font-bold mb-2">
            Margin: {options.margin}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={options.margin}
            onChange={(e) => handleChange("margin", parseInt(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>0 (tight)</span>
            <span>10 (loose)</span>
          </div>
        </div>
      </div>
    </RetroFrame>
  );
}