import { Suspense } from "react";
import { SharePageClient } from "@/components/share-page-client";

function SharePageFallback() {
  return (
    <main className="crt min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold glow mb-2">QRETRO</h1>
          <p className="text-muted">LOADING...</p>
        </div>
      </div>
    </main>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<SharePageFallback />}>
      <SharePageClient />
    </Suspense>
  );
}