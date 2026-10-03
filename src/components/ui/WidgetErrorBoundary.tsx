"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WidgetErrorBoundary caught an error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="neo-card p-4 rounded-2xl bg-slate-900/60 border border-rose-500/20 text-center space-y-2 my-2">
          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>{this.props.fallbackTitle || "Unable to load widget"}</span>
          </div>
          <p className="text-[11px] text-slate-400">A temporary error occurred displaying this component.</p>
          <button
            onClick={this.handleRetry}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] inline-flex items-center gap-1.5 border border-white/10"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
