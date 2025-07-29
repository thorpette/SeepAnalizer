import { useState } from "react";
import { Diamond, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function RubyAgentStatus() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const testRubyAgent = async () => {
    if (!url) {
      toast({
        title: "URL requerida",
        description: "Ingresa una URL para probar el agente Ruby",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await apiRequest("POST", "/api/ruby-agent", { url });
      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        toast({
          title: "Agente Ruby ejecutado",
          description: "Análisis completado exitosamente",
        });
      } else {
        setError(data.message || "Error desconocido");
        toast({
          title: "Error del agente Ruby",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error de conexión";
      setError(message);
      toast({
        title: "Error de ejecución",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return (ms / 1000).toFixed(1) + 's';
    }
    return Math.round(ms) + 'ms';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Diamond className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Agente de Rendimiento Ruby
          </h3>
          <Badge variant="secondary" className="ml-2">
            v1.0
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Análisis detallado especializado en aplicaciones Ruby on Rails con métricas avanzadas de backend.
        </p>

        {/* Test Interface */}
        <div className="flex gap-3 mb-6">
          <Input
            placeholder="https://ejemplo.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={testRubyAgent}
            disabled={loading || !url}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            {loading ? "Analizando..." : "Probar Agente"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <p className="text-sm font-medium text-red-800">Error del Agente Ruby</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">Análisis Ruby Completado</p>
                <p className="text-sm text-green-600">
                  Servidor: {results.serverTechnology} | 
                  Tiempo: {formatTime(results.responseTime)}
                </p>
              </div>
            </div>

            {/* Server Technology */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Tecnología del Servidor</h4>
                <p className="text-lg font-bold text-gray-900">{results.serverTechnology}</p>
                <p className="text-sm text-gray-600">
                  Tiempo de respuesta: {formatTime(results.responseTime)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Protocolo</h4>
                <p className="text-lg font-bold text-gray-900">{results.httpVersion}</p>
                <div className="flex items-center mt-1">
                  {results.securityHeaders.hasHTTPS ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className="text-sm text-gray-600">
                    {results.securityHeaders.hasHTTPS ? 'HTTPS Activo' : 'HTTPS Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            {/* Security Headers */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Headers de Seguridad</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(results.securityHeaders).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hasHTTPS: 'HTTPS',
                    hasHSTS: 'HSTS',
                    hasCSP: 'CSP',
                    hasXFrameOptions: 'X-Frame-Options'
                  };
                  
                  return (
                    <div key={key} className="flex items-center">
                      {value ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className="text-sm">{labels[key]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cache Headers */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Optimización de Cache</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(results.cacheHeaders).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    hasCacheControl: 'Cache-Control',
                    hasETag: 'ETag',
                    hasLastModified: 'Last-Modified'
                  };
                  
                  return (
                    <div key={key} className="flex items-center">
                      {value ? (
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                      )}
                      <span className="text-sm">{labels[key]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Database Analysis */}
            {results.database && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Análisis de Base de Datos (Ruby/Rails)
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {formatTime(results.database.queryTime)}
                    </p>
                    <p className="text-sm text-gray-600">Tiempo de Consulta</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      {results.database.connectionPool}
                    </p>
                    <p className="text-sm text-gray-600">Pool de Conexiones</p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${
                      results.database.slowQueries > 5 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {results.database.slowQueries}
                    </p>
                    <p className="text-sm text-gray-600">Consultas Lentas</p>
                  </div>
                </div>
              </div>
            )}

            {/* Compression Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Compresión Habilitada</span>
              <div className="flex items-center">
                {results.compressionEnabled ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <Badge variant="secondary">Activa</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                    <Badge variant="destructive">Inactiva</Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Características del Agente Ruby</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Detección automática de Ruby/Rails</li>
            <li>• Análisis de headers de seguridad</li>
            <li>• Evaluación de configuración de cache</li>
            <li>• Métricas de base de datos</li>
            <li>• Análisis de certificados SSL</li>
            <li>• Múltiples mediciones de tiempo de respuesta</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}