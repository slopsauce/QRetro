"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <div
      className={cn(
        "absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-2 opacity-0 pointer-events-none"
      )}
    >
      <div className="px-4 py-2 border-2 border-accent bg-background text-accent whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-accent">✓</span>
          <span className="font-bold">{message}</span>
        </div>
      </div>
    </div>
  );
}

interface UseToastReturn {
  showToast: (message: string) => void;
  ToastComponent: () => React.ReactElement;
}

export function useToast(): UseToastReturn {
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  const ToastComponent = () => (
    <Toast
      message={toastMessage}
      isVisible={isToastVisible}
      onClose={hideToast}
    />
  );

  return { showToast, ToastComponent };
}