import React from "react";
import AuthVerification from "../auth/AuthVerification";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Global UI Error Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <AuthVerification
          state="ERROR"
          title="Session Recovery Required"
          description="A visual component error occurred. Return to your career dashboard or refresh to continue."
          onRetry={this.handleReset}
          fullScreen={true}
        />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
