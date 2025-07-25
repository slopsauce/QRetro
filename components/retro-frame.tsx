import { cn } from "@/lib/utils";

interface RetroFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function RetroFrame({ children, title, className }: RetroFrameProps) {
  return (
    <div className={cn("relative mb-6", className)}>
      {/* Top border with title */}
      <div className="flex items-center text-muted opacity-60">
        <span>╔</span>
        <span className="flex-1">{'═'.repeat(20)}</span>
        {title && (
          <>
            <span>╡ </span>
            <span className="px-2 text-accent uppercase font-bold opacity-100">{title}</span>
            <span> ╞</span>
          </>
        )}
        <span className="flex-1">{'═'.repeat(20)}</span>
        <span>╗</span>
      </div>
      
      {/* Content */}
      <div className="border-x border-muted border-opacity-40 px-6 py-6">
        {children}
      </div>
      
      {/* Bottom border */}
      <div className="flex text-muted opacity-60">
        <span>╚</span>
        <span className="flex-1">{'═'.repeat(50)}</span>
        <span>╝</span>
      </div>
    </div>
  );
}