"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("QRetro Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="crt min-h-screen p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-accent mb-4">
              ERROR<span className="cursor">█</span>
            </div>
            <div className="text-lg mb-4">
              SYSTEM FAILURE - QR GENERATOR OFFLINE
            </div>
            <div className="text-sm text-muted mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="p-2 border-2 border-current hover:bg-foreground hover:text-background transition-colors"
            >
              [RESTART]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}