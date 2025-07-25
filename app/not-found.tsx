import Link from "next/link";
import { RetroFrame } from "@/components/retro-frame";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <RetroFrame className="max-w-md">
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold glow mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">ERROR: PAGE NOT FOUND</h1>
          <p className="text-muted-foreground mb-6">
            The requested resource could not be located in system memory.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">SYSTEM STATUS: OPERATIONAL</p>
            <p className="text-sm text-muted-foreground">SUGGESTED ACTION:</p>
          </div>
          <Link 
            href="/" 
            className="inline-block mt-4 px-4 py-2 border border-muted-foreground hover:bg-muted transition-colors"
          >
            [RETURN TO MAIN TERMINAL]
          </Link>
        </div>
      </RetroFrame>
    </main>
  );
}