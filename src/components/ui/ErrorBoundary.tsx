import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children?: ReactNode;
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
    console.error('Uncaught Error Boundary catch:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-6 text-center">
          <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl max-w-md space-y-4 shadow-2xl">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold">Ocorreu um erro ao carregar este módulo</h1>
            <p className="text-xs text-stone-400 leading-relaxed">
              {this.state.error?.message || 'Falha na inicialização do componente.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
