import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log para console em desenvolvimento
    console.error('ErrorBoundary capturou erro:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Em produção, enviar para serviço de logging
    if (import.meta.env.PROD) {
      // Enviar para backend ou serviço de monitoramento
      fetch('/api/log-error.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Algo deu errado</h1>
            <p className="text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left">
                <details className="bg-muted p-4 rounded text-xs">
                  <summary className="cursor-pointer font-semibold mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="overflow-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="overflow-auto whitespace-pre-wrap mt-2 pt-2 border-t">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button onClick={this.handleReset}>
                Voltar ao Início
              </Button>
              <Button variant="outline" onClick={this.handleReload}>
                Recarregar Página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
