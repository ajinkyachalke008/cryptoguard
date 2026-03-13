// src/hub/shared/HubErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class HubErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Hub Module Crash:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 rounded-3xl bg-red-950/10 border border-red-500/20 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-xl">
          <div className="p-4 bg-red-500/20 rounded-full border border-red-500/30">
            <AlertTriangle className="text-red-500 size-12 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">INTELLIGENCE_MODULE_OFFLINE</h2>
            <p className="text-xs text-gray-500 font-mono max-w-md mx-auto">
              {this.state.error?.message || 'A critical rendering error occurred in this module.'}
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <RefreshCw size={16} />
            <span>Resynchronize System</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
