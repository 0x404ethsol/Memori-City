import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Terminal, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full border border-neon-pink/30 bg-void/80 backdrop-blur-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 warning-stripes opacity-20" />
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-neon-pink/10 flex items-center justify-center border border-neon-pink/30">
                <AlertTriangle className="text-neon-pink" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-display font-black text-neon-pink uppercase tracking-widest">System_Fault</h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Kernel_Panic // 致命的なエラー</p>
              </div>
            </div>

            <div className="bg-black/40 p-4 border border-white/5 mb-6 overflow-hidden">
              <div className="text-[10px] text-neon-cyan mb-2 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={10} />
                <span>Error_Log</span>
              </div>
              <pre className="text-[10px] text-white/60 whitespace-pre-wrap break-all leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                {this.state.error?.toString() || 'Unknown_Exception'}
                {"\n\n"}
                {typeof this.state.error === 'object' && JSON.stringify(this.state.error, null, 2)}
              </pre>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-neon-pink/10 border border-neon-pink/40 text-neon-pink text-xs font-bold uppercase tracking-[0.3em] hover:bg-neon-pink hover:text-white transition-all flex items-center justify-center gap-3 group"
            >
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Reboot_System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
