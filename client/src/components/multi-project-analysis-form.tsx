import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Globe, Server, Database, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { PerformanceAnalysis } from "@shared/schema";

interface MultiProjectAnalysisFormProps {
  projectSelection: {
    projectId?: number;
    applicationId?: number;
    environmentId?: number;
    url?: string;
    device: 'desktop' | 'mobile';
  };
  onAnalysisStart: () => void;
  onAnalysisSuccess: (analysis: PerformanceAnalysis) => void;
  onAnalysisError: (message: string) => void;
  disabled?: boolean;
}

export function MultiProjectAnalysisForm({
  projectSelection,
  onAnalysisStart,
  onAnalysisSuccess,
  onAnalysisError,
  disabled = false
}: MultiProjectAnalysisFormProps) {
  const { toast } = useToast();
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const requestBody = {
        projectId: projectSelection.projectId,
        applicationId: projectSelection.applicationId,
        environmentId: projectSelection.environmentId,
        url: projectSelection.url,
        device: projectSelection.device,
      };

      console.log('🚀 Iniciando análisis multi-proyecto:', requestBody);
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }

      const { analysisId } = await response.json();
      return analysisId;
    },
    onSuccess: (analysisId: number) => {
      toast({
        title: "Análisis iniciado",
        description: "El análisis de rendimiento ha comenzado...",
      });

      onAnalysisStart();
      startPolling(analysisId);
    },
    onError: (error: Error) => {
      console.error('❌ Error iniciando análisis:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      onAnalysisError(error.message);
    },
  });

  const startPolling = (analysisId: number) => {
    const pollAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyses/${analysisId}`);
        if (!response.ok) {
          throw new Error(`Error obteniendo análisis: ${response.status}`);
        }

        const analysis = await response.json();
        
        if (analysis.status === "completed") {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          onAnalysisSuccess(analysis);
          toast({
            title: "Análisis completado",
            description: "El análisis de rendimiento ha finalizado exitosamente.",
          });
        } else if (analysis.status === "failed") {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          const errorMsg = analysis.errorMessage || "El análisis falló";
          onAnalysisError(errorMsg);
          toast({
            title: "Error en el análisis",
            description: errorMsg,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('❌ Error polling análisis:', error);
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        const errorMsg = error instanceof Error ? error.message : "Error desconocido";
        onAnalysisError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollAnalysis, 2000);
    setPollingInterval(interval);
  };

  const handleSubmit = () => {
    if (!projectSelection.url) {
      toast({
        title: "Error",
        description: "Selecciona un entorno o introduce una URL",
        variant: "destructive",
      });
      return;
    }

    analysisMutation.mutate();
  };

  const getEnvironmentBadgeColor = (envName?: string) => {
    if (!envName) return 'bg-gray-100 text-gray-800';
    
    switch (envName.toLowerCase()) {
      case 'prod':
      case 'production':
      case 'producción':
        return 'bg-red-100 text-red-800';
      case 'staging':
      case 'stage':
        return 'bg-yellow-100 text-yellow-800';
      case 'dev':
      case 'development':
      case 'desarrollo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get projects data for display
  const { data: projectsData = [] } = useQuery<any[]>({
    queryKey: ['/api/project-structure'],
    initialData: [],
  });
  
  const selectedProject = projectsData.find((p: any) => p.id === projectSelection.projectId);
  const selectedApplication = selectedProject?.applications?.find((a: any) => a.id === projectSelection.applicationId);
  const selectedEnvironment = selectedApplication?.environments?.find((e: any) => e.id === projectSelection.environmentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Iniciar Análisis de Rendimiento
        </CardTitle>
        <CardDescription>
          Análisis completo de rendimiento para el entorno seleccionado
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Analysis Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Resumen del Análisis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">Proyecto:</span>
                <span>{selectedProject?.name || 'No especificado'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">Aplicación:</span>
                <span>{selectedApplication?.name || 'No especificado'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span className="font-medium">Entorno:</span>
                {selectedEnvironment ? (
                  <Badge className={getEnvironmentBadgeColor(selectedEnvironment.name)}>
                    {selectedEnvironment.displayName}
                  </Badge>
                ) : (
                  <span>URL personalizada</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="font-medium">Dispositivo:</span>
                <Badge variant="outline">
                  {projectSelection.device === 'desktop' ? '🖥️ Escritorio' : '📱 Móvil'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="font-medium">URL:</span>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {projectSelection.url}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium">Análisis Frontend</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Core Web Vitals (FCP, LCP, TBT, CLS)</li>
              <li>• Puntuaciones de rendimiento</li>
              <li>• Métricas de accesibilidad</li>
              <li>• Mejores prácticas y SEO</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h5 className="font-medium">Análisis Backend</h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Detección de tecnología del servidor</li>
              <li>• Análisis de headers de seguridad</li>
              <li>• Optimización de caché</li>
              <li>• Rendimiento de base de datos</li>
            </ul>
          </div>
        </div>

        {/* Start Analysis Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={disabled || !projectSelection.url || analysisMutation.isPending}
            size="lg"
            className="w-full md:w-auto"
          >
            {analysisMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Iniciando análisis...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Análisis de Rendimiento
              </>
            )}
          </Button>
        </div>

        {/* Analysis Description */}
        <div className="text-sm text-muted-foreground text-center">
          <p>
            El análisis incluye evaluación completa de rendimiento frontend y backend,
            proporcionando métricas detalladas y recomendaciones específicas para optimización.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}