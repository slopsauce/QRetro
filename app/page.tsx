import { QRGenerator } from "@/components/qr-generator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";

// Ensure this page is statically exported
export const dynamic = 'error';

export default function Home() {
  return (
    <ErrorBoundary>
      <main>
        <ThemeToggle />
        <QRGenerator />
      </main>
    </ErrorBoundary>
  );
}