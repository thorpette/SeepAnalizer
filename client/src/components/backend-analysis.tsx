import { Server, Database, Shield, Zap, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BackendAnalysisProps {
  backendAnalysis: {
    serverTechnology: string;
    responseTime: number;
    serverLocation?: string;
    httpVersion: string;
    compressionEnabled: boolean;
    securityHeaders: {
      hasHTTPS: boolean;
      hasHSTS: boolean;
      hasCSP: boolean;
      hasXFrameOptions: boolean;
    };
    cacheHeaders: {
      hasCacheControl: boolean;
      hasETag: boolean;
      hasLastModified: boolean;
    };
    database?: {
      queryTime: number;
      connectionPool?: number;
      slowQueries: number;
    };
  };
}

export default function BackendAnalysis({ backendAnalysis }: BackendAnalysisProps) {
  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return (ms / 1000).toFixed(1) + 's';
    }
    return Math.round(ms) + 'ms';
  };

  const getResponseTimeStatus = (responseTime: number) => {
    if (responseTime < 200) return { status: "Excelente", color: "text-success-green", icon: CheckCircle };
    if (responseTime < 500) return { status: "Bueno", color: "text-success-green", icon: CheckCircle };
    if (responseTime < 1000) return { status: "Necesita Mejora", color: "text-warning-orange", icon: AlertCircle };
    return { status: "Pobre", color: "text-error-red", icon: XCircle };
  };

  const responseTimeStatus = getResponseTimeStatus(backendAnalysis.responseTime);
  const ResponseTimeIcon = responseTimeStatus.icon;

  const securityScore = Object.values(backendAnalysis.securityHeaders).filter(Boolean).length;
  const cacheScore = Object.values(backendAnalysis.cacheHeaders).filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Server className="w-5 h-5 text-google-blue mr-2" />
          Análisis del Backend
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Server Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Server className="w-4 h-4 mr-2" />
                Información del Servidor
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tecnología:</span>
                  <span className="font-medium">{backendAnalysis.serverTechnology}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versión HTTP:</span>
                  <span className="font-medium">{backendAnalysis.httpVersion}</span>
                </div>
                {backendAnalysis.serverLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">{backendAnalysis.serverLocation}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Compresión:</span>
                  <div className="flex items-center">
                    {backendAnalysis.compressionEnabled ? (
                      <CheckCircle className="w-4 h-4 text-success-green mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 text-error-red mr-1" />
                    )}
                    <span className="font-medium">
                      {backendAnalysis.compressionEnabled ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Tiempo de Respuesta
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${responseTimeStatus.color}`}>
                    {formatTime(backendAnalysis.responseTime)}
                  </div>
                  <div className={`text-sm ${responseTimeStatus.color} flex items-center`}>
                    <ResponseTimeIcon className="w-4 h-4 mr-1" />
                    {responseTimeStatus.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Cache */}
          <div className="space-y-4">
            {/* Security Headers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Headers de Seguridad ({securityScore}/4)
              </h4>
              <div className="space-y-2">
                {Object.entries(backendAnalysis.securityHeaders).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hasHTTPS: 'HTTPS',
                    hasHSTS: 'HSTS',
                    hasCSP: 'CSP',
                    hasXFrameOptions: 'X-Frame-Options'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{labels[key]}:</span>
                      <div className="flex items-center">
                        {value ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-success-green mr-1" />
                            <Badge variant="secondary" className="text-xs">Activo</Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-error-red mr-1" />
                            <Badge variant="destructive" className="text-xs">Inactivo</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cache Headers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Headers de Cacheo ({cacheScore}/3)
              </h4>
              <div className="space-y-2">
                {Object.entries(backendAnalysis.cacheHeaders).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hasCacheControl: 'Cache-Control',
                    hasETag: 'ETag',
                    hasLastModified: 'Last-Modified'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{labels[key]}:</span>
                      <div className="flex items-center">
                        {value ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-success-green mr-1" />
                            <Badge variant="secondary" className="text-xs">Activo</Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-error-red mr-1" />
                            <Badge variant="outline" className="text-xs">Inactivo</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Database Analysis */}
        {backendAnalysis.database && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Database className="w-4 h-4 mr-2 text-google-blue" />
              Análisis de Base de Datos (Ruby/Rails)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatTime(backendAnalysis.database.queryTime)}
                </div>
                <div className="text-sm text-gray-600">Tiempo Promedio de Consulta</div>
              </div>
              {backendAnalysis.database.connectionPool && (
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {backendAnalysis.database.connectionPool}
                  </div>
                  <div className="text-sm text-gray-600">Pool de Conexiones</div>
                </div>
              )}
              <div className="text-center">
                <div className={`text-lg font-bold ${backendAnalysis.database.slowQueries > 5 ? 'text-error-red' : 'text-success-green'}`}>
                  {backendAnalysis.database.slowQueries}
                </div>
                <div className="text-sm text-gray-600">Consultas Lentas</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}