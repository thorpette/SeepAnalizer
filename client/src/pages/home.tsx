import { useState } from "react";
import { Gauge, Building2, Globe, Server } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectSelector } from "@/components/project-selector";
import { MultiProjectAnalysisForm } from "@/components/multi-project-analysis-form";
import UrlAnalysisForm from "@/components/url-analysis-form";
import LoadingState from "@/components/loading-state";
import PerformanceResults from "@/components/performance-results";
import ErrorState from "@/components/error-state";
import { PerformanceAnalysis } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface Project {
  id: number;
  name: string;
  description?: string;
  applications: Application[];
}

interface Application {
  id: number;
  projectId: number;
  name: string;
  description?: string;
  environments: Environment[];
}

interface Environment {
  id: number;
  applicationId: number;
  name: string;
  displayName: string;
  url: string;
  description?: string;
  isActive: boolean;
}

function ProjectStatsOverview() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/project-structure'],
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProjects = projects.length;
  const totalApplications = projects.reduce((acc, p) => acc + p.applications.length, 0);
  const totalEnvironments = projects.reduce((acc, p) => 
    acc + p.applications.reduce((appAcc, app) => appAcc + app.environments.length, 0), 0
  );
  const activeEnvironments = projects.reduce((acc, p) => 
    acc + p.applications.reduce((appAcc, app) => 
      appAcc + app.environments.filter(env => env.isActive).length, 0
    ), 0
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building2 className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Proyectos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Aplicaciones</p>
                <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Server className="h-4 w-4 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Entornos</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnvironments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeEnvironments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Quick Overview */}
      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-blue-600" />
              Resumen de Proyectos
            </CardTitle>
            <CardDescription>
              Vista rápida de todos los proyectos y sus entornos disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">{project.name}</h4>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  )}
                  <div className="space-y-2">
                    {project.applications.map((app) => (
                      <div key={app.id} className="text-sm">
                        <span className="font-medium text-gray-700">{app.name}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {app.environments.map((env) => (
                            <Badge
                              key={env.id}
                              variant="outline"
                              className={`text-xs ${
                                env.isActive 
                                  ? env.name.toLowerCase().includes('prod') 
                                    ? 'border-red-200 text-red-700 bg-red-50'
                                    : env.name.toLowerCase().includes('staging')
                                    ? 'border-yellow-200 text-yellow-700 bg-yellow-50'
                                    : 'border-green-200 text-green-700 bg-green-50'
                                  : 'border-gray-200 text-gray-500 bg-gray-50'
                              }`}
                            >
                              {env.displayName} {!env.isActive && '(Inactivo)'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
                href="/admin"
                className="text-sm text-purple-600 hover:text-purple-800 underline"
              >
                ⚙️ Administración
              </a>
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
        {/* Project Statistics Overview */}
        <ProjectStatsOverview />
        
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
