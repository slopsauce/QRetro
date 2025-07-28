"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { RetroFrame } from "@/components/retro-frame";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShareQRDisplay } from "@/components/share-qr-display";

export function SharePageClient() {
  const [type, setType] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract QR data from URL fragment (hash)
  useEffect(() => {
    const parseFragment = () => {
      try {
        // Get the full URL to handle iOS quirks
        const fullHash = window.location.href.split('#')[1] || window.location.hash.slice(1);
        
        if (fullHash) {
          // Manual parsing for better iOS compatibility
          const pairs = fullHash.split('&');
          let typeValue = null;
          let dataValue = null;
          
          for (const pair of pairs) {
            const [key, ...valueParts] = pair.split('=');
            const value = valueParts.join('='); // Handle = in the value
            
            if (key === 'type') {
              typeValue = value;
            } else if (key === 'data') {
              dataValue = value;
            }
          }
          
          setType(typeValue);
          setData(dataValue);
        }
      } catch (error) {
        console.error('Error parsing share URL:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Multiple attempts to handle iOS timing issues
    const attempts = [0, 100, 300];
    const timeouts: NodeJS.Timeout[] = [];
    
    attempts.forEach(delay => {
      const timeout = setTimeout(() => {
        if (!type && !data) {
          parseFragment();
        }
      }, delay);
      timeouts.push(timeout);
    });

    // Listen for hash changes
    const handleHashChange = () => parseFragment();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [type, data]);
  
  if (isLoading) {
    return (
      <main className="crt min-h-screen p-8">
        <ThemeToggle />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold glow mb-2">QRETRO</h1>
            <p className="text-muted">LOADING...</p>
          </div>
        </div>
      </main>
    );
  }

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
          <p className="text-muted">SHARED QR CODE - {type?.toUpperCase() || 'UNKNOWN'}</p>
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