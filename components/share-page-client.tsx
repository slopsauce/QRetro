"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RetroFrame } from "@/components/retro-frame";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareQRDisplay } from "@/components/share-qr-display";

export function SharePageClient() {
  const [type, setType] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  
  // Extract QR data from URL fragment (hash)
  useEffect(() => {
    const parseFragment = () => {
      const fragment = window.location.hash.slice(1); // Remove the #
      if (fragment) {
        const params = new URLSearchParams(fragment);
        setType(params.get("type"));
        setData(params.get("data"));
      }
    };

    // Parse on mount
    parseFragment();

    // Listen for hash changes
    const handleHashChange = () => parseFragment();
    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  if (!type || !data) {
    return (
      <main className="crt min-h-screen p-8">
        <ThemeToggle />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold glow mb-2">QRETRO</h1>
            <p className="text-muted">SHARED QR CODE</p>
          </div>
          
          <RetroFrame title="ERROR">
            <div className="text-center py-20">
              <div className="text-accent mb-4">INVALID SHARE LINK</div>
              <Link 
                href="/"
                className="px-4 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors inline-block"
              >
                [BACK TO GENERATOR]
              </Link>
            </div>
          </RetroFrame>
        </div>
      </main>
    );
  }

  // Decode the data
  const decodedData = decodeURIComponent(data);
  
  return (
    <main className="crt min-h-screen p-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow mb-2">QRETRO</h1>
          <p className="text-muted">SHARED QR CODE - {type.toUpperCase()}</p>
        </div>
        
        <RetroFrame title="SHARED QR CODE">
          <div className="text-center">
            <div className="text-xs text-muted opacity-75 mb-4">
              <div className="flex items-center justify-center gap-1">
                <span className="text-accent">[🔒]</span>
                <span>No tracking - your data stays private</span>
              </div>
            </div>
            <ShareQRDisplay qrData={decodedData} />
            
            <div className="text-muted my-4">
              Scan this QR code with your phone to access the data.
            </div>
            
            <div className="text-muted my-4 flex items-center justify-center gap-1">
              <span className="text-accent">[⚠]</span>
              <span>Only scan QR codes from people you trust</span>
            </div>
            
            <Link 
              href="/"
              className="px-4 py-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors inline-block"
            >
              [CREATE YOUR OWN]
            </Link>
          </div>
        </RetroFrame>
      </div>
    </main>
  );
}