import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Pujaveda ErrorBoundary] Uncaught render exception:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-7 text-center shadow-xl shadow-[#5C0F17]/5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#5C0F17]">
              <AlertCircle size={28} />
            </div>
            <h2 className="mt-4 text-xl font-black font-devotional text-[#4A0D15]">
              Something went wrong
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#756255] leading-relaxed">
              We encountered an unexpected display error. Please refresh the page or return to the storefront.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#5C0F17] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#43080E] shadow-sm"
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#EEDBC5] bg-white px-5 py-2.5 text-xs font-bold text-[#3D2619] transition hover:bg-[#FAF6F0]"
              >
                <Home size={14} /> Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
