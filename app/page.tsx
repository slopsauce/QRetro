import { QRGenerator } from "@/components/qr-generator";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main>
      <ThemeToggle />
      <QRGenerator />
    </main>
  );
}