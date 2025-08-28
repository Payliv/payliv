import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, WifiOff } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
    this.resetBoundary = this.resetBoundary.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  resetBoundary() {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || (this.state.error ? this.state.error.toString() : '');
      
      const isNetworkError = errorMessage.includes('Failed to fetch');
      const isKnownBackendError = errorMessage.includes('Cannot convert object to primitive value');

      if (isNetworkError) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
            <WifiOff className="w-16 h-16 text-destructive mb-4" />
            <h1 className="text-3xl font-bold text-destructive mb-4">Erreur de Connexion</h1>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Impossible de communiquer avec nos serveurs. Veuillez vérifier votre connexion internet et désactiver les bloqueurs de publicité, puis rafraîchissez la page.
            </p>
            <Button onClick={() => window.location.reload()}>Rafraîchir la page</Button>
          </div>
        );
      }

      if (isKnownBackendError) {
        return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
            <ShieldAlert className="w-16 h-16 text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Erreur d'arrière-plan interceptée</h1>
            <p className="text-muted-foreground mb-6 max-w-lg">
              Une opération en arrière-plan a rencontré une erreur non critique connue. Votre application est toujours fonctionnelle. Vous pouvez continuer à naviguer en toute sécurité.
            </p>
            <Button onClick={this.resetBoundary}>Continuer</Button>
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h1 className="text-3xl font-bold text-destructive mb-4">Oups ! Une erreur est survenue.</h1>
          <p className="text-muted-foreground mb-6 max-w-lg">
            Nous avons rencontré un problème inattendu. Vous pouvez rafraîchir la page ou tenter de continuer. Si le problème persiste, contactez le support.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>Rafraîchir la page</Button>
            <Button variant="outline" onClick={this.resetBoundary}>Tenter de continuer</Button>
          </div>
          
          <details className="mt-8 text-left max-w-2xl w-full">
            <summary className="cursor-pointer text-muted-foreground">Détails de l'erreur</summary>
            <pre className="mt-2 bg-muted text-muted-foreground p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap break-words">
              <strong>Error:</strong> {this.state.error?.toString() || 'Unknown Error'}
              <br /><br />
              <strong>Stack Trace:</strong>
              <br />
              {this.state.error?.stack || 'No stack trace available.'}
              <br /><br />
              <strong>Component Stack:</strong>
              <br />
              {this.state.errorInfo?.componentStack || 'No component stack.'}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;