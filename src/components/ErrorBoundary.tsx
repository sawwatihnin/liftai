import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[LiftAI] ErrorBoundary caught a render error.', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-coral/40 bg-ink/80 p-6 shadow-glow">
            <p className="text-sm uppercase tracking-[0.28em] text-coral">LiftAI</p>
            <h1 className="mt-3 text-3xl font-bold">LiftAI Loaded</h1>
            <p className="mt-4 text-slate-300">
              React started, but the app hit a runtime error. The diagnostics below should make the
              failure visible instead of leaving a blank screen.
            </p>
            <div className="mt-6 rounded-2xl border border-coral/40 bg-coral/10 p-4">
              <p className="text-sm font-semibold text-coral">Current error</p>
              <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm text-white">
                {this.state.error.message}
              </pre>
            </div>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
