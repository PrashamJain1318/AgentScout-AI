import React from 'react';
import AuthVerification from '../auth/AuthVerification';

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

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <AuthVerification
          state="ERROR"
          title="UI Rendering Error"
          description="Something went wrong while loading the page layout. Please refresh to restore your session."
          onRetry={this.handleReload}
          fullScreen={true}
        />
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
