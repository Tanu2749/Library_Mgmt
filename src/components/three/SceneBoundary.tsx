"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { SceneFallback } from "./SceneFallback";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SceneBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("3D Hero Canvas encountered an error. Falling back gracefully:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <SceneFallback />;
    }

    return this.props.children;
  }
}
