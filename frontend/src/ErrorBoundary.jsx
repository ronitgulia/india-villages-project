import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "Arial", backgroundColor: "#fdf0f0", minHeight: "100vh" }}>
          <h1 style={{ color: "#e74c3c" }}>Oops! Something went wrong.</h1>
          <p style={{ color: "#7f8c8d" }}>We are sorry for the inconvenience. Please try refreshing the page.</p>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "20px", color: "#e74c3c", textAlign: "left", display: "inline-block" }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
