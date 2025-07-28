import { QRGenerator } from "@/components/qr-generator";
import { AppControls } from "@/components/app-controls";
import { ErrorBoundary } from "@/components/error-boundary";

// Ensure this page is statically exported
export const dynamic = 'error';

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <AppControls />
        <QRGenerator />
      </main>
    </ErrorBoundary>
  );
}