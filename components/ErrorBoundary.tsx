// components/ErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "8px",
              margin: "2rem",
              maxWidth: "800px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h2>Ein Fehler ist aufgetreten</h2>
            <p>Die Kartenkomponente konnte nicht geladen werden.</p>
            <button
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              Erneut versuchen
            </button>
            {this.state.error && (
              <details style={{ marginTop: "1rem", textAlign: "left" }}>
                <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                  Technische Details
                </summary>
                <pre
                  style={{
                    fontSize: "0.8rem",
                    backgroundColor: "#f5f5f5",
                    padding: "1rem",
                    borderRadius: "4px",
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Alternative: Functional Error Boundary using react-error-boundary
// Jeśli wolisz używać hook-based approach, zainstaluj react-error-boundary:
// npm install react-error-boundary

/*
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      backgroundColor: '#fee',
      border: '1px solid #fcc',
      borderRadius: '8px',
      margin: '2rem'
    }}>
      <h2>Ein Fehler ist aufgetreten</h2>
      <p>Die Kartenkomponente konnte nicht geladen werden.</p>
      <button onClick={resetErrorBoundary}>Erneut versuchen</button>
      <details style={{ marginTop: '1rem', textAlign: 'left' }}>
        <summary>Fehlerdetails</summary>
        <pre style={{ fontSize: '0.8rem' }}>{error.message}</pre>
      </details>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
*/
