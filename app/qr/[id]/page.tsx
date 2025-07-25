import Link from "next/link";
import { RetroFrame } from "@/components/retro-frame";
import { ThemeToggle } from "@/components/theme-toggle";

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { id } = await params;
  const search = await searchParams;
  
  // Extract QR data from URL parameters
  const type = search.type as string;
  const data = search.data as string;
  
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
            <div className="mb-4 p-4 border-2 border-current">
              <div className="text-sm text-muted mb-2">QR DATA:</div>
              <div className="break-all text-foreground">{decodedData}</div>
            </div>
            
            <div className="text-muted mb-4">
              Scan this QR code with your device to access the data.
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