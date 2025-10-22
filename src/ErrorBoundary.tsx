import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error } as State;
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error("App render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui' }}>
          <h2>Ocorreu um erro ao renderizar a aplicação</h2>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#b00', marginTop: 12 }}>
            {String(this.state.error)}
          </pre>
          <p style={{ marginTop: 8, color: '#555' }}>Veja o Console do navegador para detalhes.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

