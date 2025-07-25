import React from "react";
import { cn } from "@/lib/utils";

interface RetroFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const RetroFrame = React.memo(function RetroFrame({ children, title, className }: RetroFrameProps) {
  return (
    <div className={cn("relative mb-6 font-mono", className)}>
      {/* Top border with title */}
      <div className="flex items-center text-muted opacity-60 whitespace-nowrap">
        <span>╔</span>
        <span className="flex-1 overflow-hidden">{'═'.repeat(100)}</span>
        {title && (
          <>
            <span>╡</span>
            <span className="px-2 text-accent uppercase font-bold opacity-100">{title}</span>
            <span>╞</span>
          </>
        )}
        <span className="flex-1 overflow-hidden">{'═'.repeat(100)}</span>
        <span>╗</span>
      </div>
      
      {/* Content with ASCII vertical borders */}
      <div className="flex">
        <span className="text-muted opacity-60">║</span>
        <div className="flex-1 px-6 py-6">{children}</div>
        <span className="text-muted opacity-60">║</span>
      </div>
      
      {/* Bottom border */}
      <div className="flex items-center text-muted opacity-60 whitespace-nowrap">
        <span>╚</span>
        <span className="flex-1 overflow-hidden">{'═'.repeat(100)}</span>
        <span>╝</span>
      </div>
    </div>
  );
});