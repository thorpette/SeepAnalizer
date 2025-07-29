import { useState } from "react";
import { Gauge } from "lucide-react";
import UrlAnalysisForm from "@/components/url-analysis-form";
import LoadingState from "@/components/loading-state";
import PerformanceResults from "@/components/performance-results";
import ErrorState from "@/components/error-state";
import { PerformanceAnalysis } from "@shared/schema";

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleAnalysisStart = () => {
    setAnalysisState('loading');
    setCurrentAnalysis(null);
    setErrorMessage('');
  };

  const handleAnalysisSuccess = (analysis: PerformanceAnalysis) => {
    setCurrentAnalysis(analysis);
    setAnalysisState('success');
  };

  const handleAnalysisError = (message: string) => {
    setErrorMessage(message);
    setAnalysisState('error');
    setCurrentAnalysis(null);
  };

  const handleRetry = () => {
    setAnalysisState('idle');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gauge className="text-google-blue text-2xl" size={32} />
              <h1 className="text-2xl font-medium text-gray-900">PageSpeed Analyzer</h1>
              <span className="text-sm text-gray-500">con Agente Ruby Integrado</span>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/user-manual" 
                target="_blank"
                className="text-sm text-green-600 hover:text-green-800 underline"
              >
                📚 Manual de Usuario
              </a>
              <a 
                href="/design-document" 
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                📄 Documento de Diseño
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* URL Analysis Form */}
        <UrlAnalysisForm
          onAnalysisStart={handleAnalysisStart}
          onAnalysisSuccess={handleAnalysisSuccess}
          onAnalysisError={handleAnalysisError}
          disabled={analysisState === 'loading'}
        />

        {/* Loading State */}
        {analysisState === 'loading' && <LoadingState />}

        {/* Error State */}
        {analysisState === 'error' && (
          <ErrorState message={errorMessage} onRetry={handleRetry} />
        )}

        {/* Performance Results */}
        {analysisState === 'success' && currentAnalysis && (
          <PerformanceResults analysis={currentAnalysis} />
        )}
      </main>
    </div>
  );
}
