import { useState } from "react";
import { Gauge } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectSelector } from "@/components/project-selector";
import { MultiProjectAnalysisForm } from "@/components/multi-project-analysis-form";
import UrlAnalysisForm from "@/components/url-analysis-form";
import LoadingState from "@/components/loading-state";
import PerformanceResults from "@/components/performance-results";
import ErrorState from "@/components/error-state";
import { PerformanceAnalysis } from "@shared/schema";

export default function Home() {
  const [currentAnalysis, setCurrentAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [projectSelection, setProjectSelection] = useState<{
    projectId?: number;
    applicationId?: number;
    environmentId?: number;
    url?: string;
    device: 'desktop' | 'mobile';
  } | null>(null);

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="multi-project" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="multi-project">🏢 Análisis Multi-Proyecto</TabsTrigger>
            <TabsTrigger value="custom-url">🌐 URL Personalizada</TabsTrigger>
          </TabsList>
          
          <TabsContent value="multi-project" className="mt-6">
            <div className="space-y-6">
              <ProjectSelector
                onSelectionChange={(selection) => {
                  setProjectSelection(selection);
                  setDevice(selection.device);
                }}
                device={device}
                onDeviceChange={setDevice}
              />
              
              {projectSelection?.url && (
                <MultiProjectAnalysisForm
                  projectSelection={projectSelection}
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisSuccess={handleAnalysisSuccess}
                  onAnalysisError={handleAnalysisError}
                  disabled={analysisState === 'loading'}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom-url" className="mt-6">
            <UrlAnalysisForm
              onAnalysisStart={handleAnalysisStart}
              onAnalysisSuccess={handleAnalysisSuccess}
              onAnalysisError={handleAnalysisError}
              disabled={analysisState === 'loading'}
            />
          </TabsContent>
        </Tabs>

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
