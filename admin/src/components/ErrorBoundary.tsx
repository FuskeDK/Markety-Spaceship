// React class-based error boundary wrapping the entire app (mounted in App.tsx).
// Catches any unhandled render errors and shows a generic fallback screen
// instead of a blank white page. Errors are logged to the console for
// debugging. See App.tsx for where this wraps AnimatedRoutes.
import React from "react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 text-center">
          <div>
            <p className="text-xl font-semibold mb-2">Something went wrong.</p>
            <p className="text-sm text-muted-foreground">Please refresh the page or try again later.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
