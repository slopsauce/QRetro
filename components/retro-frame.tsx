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
        <div className="flex-1 flex items-center">
          <span className="flex-1">{'═'.repeat(1)}</span>
          {title && (
            <>
              <span className="mx-1">╡</span>
              <span className="px-2 text-accent uppercase font-bold opacity-100">{title}</span>
              <span className="mx-1">╞</span>
            </>
          )}
          <span className="flex-1">{'═'.repeat(1)}</span>
        </div>
        <span>╗</span>
      </div>
      
      {/* Content */}
      <div className="border-x border-muted border-opacity-40 px-6 py-6">
        {children}
      </div>
      
      {/* Bottom border */}
      <div className="flex text-muted opacity-60">
        <span>╚</span>
        <div className="flex-1">{'═'.repeat(1)}</div>
        <span>╝</span>
      </div>
    </div>
  );
}