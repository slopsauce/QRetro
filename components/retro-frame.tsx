import { cn } from "@/lib/utils";

interface RetroFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function RetroFrame({ children, title, className }: RetroFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Top border with title */}
      <div className="flex items-center">
        <span className="text-current">╔</span>
        <span className="flex-1 text-current">{'═'.repeat(20)}</span>
        {title && (
          <>
            <span className="text-current">╡ </span>
            <span className="px-2 text-accent uppercase">{title}</span>
            <span className="text-current"> ╞</span>
          </>
        )}
        <span className="flex-1 text-current">{'═'.repeat(20)}</span>
        <span className="text-current">╗</span>
      </div>
      
      {/* Content */}
      <div className="border-x-2 border-current px-4 py-4">
        {children}
      </div>
      
      {/* Bottom border */}
      <div className="flex">
        <span className="text-current">╚</span>
        <span className="flex-1 text-current">{'═'.repeat(50)}</span>
        <span className="text-current">╝</span>
      </div>
    </div>
  );
}