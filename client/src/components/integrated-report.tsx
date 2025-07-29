import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Zap,
  Database,
  Globe,
  Server,
  Lock,
  Target,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface AnalysisData {
  id: string;
  url: string;
  device: string;
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  resourceDetails: {
    pageSize: number;
    requestCount: number;
    loadTime: number;
  };
  backendAnalysis: {
    serverTechnology: string;
    responseTime: number;
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
      connectionPool: number;
      slowQueries: string;
    };
  };
  recommendations: Array<{
    id: string;
    title: string;
    impact: string;
    category: string;
    description: string;
    potentialSavings?: string;
  }>;
  analyzedAt: string;
  status: string;
}

interface IntegratedReportProps {
  analysis: AnalysisData;
}

export function IntegratedReport({ analysis }: IntegratedReportProps) {
  const { metrics, backendAnalysis, resourceDetails } = analysis;

  // Calculate overall health
  const avgScore = Math.round((analysis.performanceScore + analysis.accessibilityScore + analysis.bestPracticesScore + analysis.seoScore) / 4);
  const getHealthLevel = (score: number) => {
    if (score >= 90) return { level: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 75) return { level: 'Bueno', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (score >= 50) return { level: 'Necesita Mejora', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Deficiente', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const healthStatus = getHealthLevel(avgScore);

  // Core Web Vitals Analysis
  const getCoreWebVitalStatus = (metric: string, value: number) => {
    const thresholds = {
      firstContentfulPaint: { good: 1800, needsImprovement: 3000 },
      largestContentfulPaint: { good: 2500, needsImprovement: 4000 },
      totalBlockingTime: { good: 200, needsImprovement: 600 },
      cumulativeLayoutShift: { good: 0.1, needsImprovement: 0.25 }
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return { status: 'unknown', color: 'text-gray-500' };

    if (value <= threshold.good) return { status: 'Bueno', color: 'text-green-600' };
    if (value <= threshold.needsImprovement) return { status: 'Mejorable', color: 'text-yellow-600' };
    return { status: 'Deficiente', color: 'text-red-600' };
  };

  // Resource Efficiency Analysis
  const getResourceEfficiency = () => {
    const pageSize = resourceDetails.pageSize;
    const requestCount = resourceDetails.requestCount;
    
    const pageSizeEfficiency = pageSize < 1000000 ? 'excellent' : pageSize < 3000000 ? 'good' : 'needs_improvement';
    const requestEfficiency = requestCount < 50 ? 'excellent' : requestCount < 100 ? 'good' : 'needs_improvement';
    
    return { pageSizeEfficiency, requestEfficiency };
  };

  // Security Assessment
  const getSecurityScore = () => {
    const security = backendAnalysis.securityHeaders;
    return (
      (security.hasHTTPS ? 40 : 0) +
      (security.hasHSTS ? 25 : 0) +
      (security.hasCSP ? 20 : 0) +
      (security.hasXFrameOptions ? 15 : 0)
    );
  };

  // Critical Issues Identification
  const getCriticalIssues = () => {
    const issues = [];
    
    if (!backendAnalysis.securityHeaders.hasHTTPS) {
      issues.push({
        type: 'Seguridad',
        severity: 'Crítico',
        issue: 'Falta HTTPS',
        impact: 'Datos no cifrados, penalización SEO'
      });
    }
    
    if (metrics.largestContentfulPaint > 4000) {
      issues.push({
        type: 'Rendimiento',
        severity: 'Crítico',
        issue: 'LCP muy lento',
        impact: 'Experiencia de usuario deficiente'
      });
    }
    
    if (backendAnalysis.responseTime > 1000) {
      issues.push({
        type: 'Rendimiento',
        severity: 'Alto',
        issue: 'Servidor lento',
        impact: 'Retrasos en toda la experiencia'
      });
    }
    
    return issues;
  };

  // Frontend-Backend Correlation
  const getCorrelationAnalysis = () => {
    const serverTime = backendAnalysis.responseTime;
    const frontendTime = metrics.firstContentfulPaint;
    const serverImpact = Math.min((serverTime / frontendTime) * 100, 100);
    
    return {
      serverImpact,
      analysis: serverImpact > 50 ? 
        'El servidor es el principal cuello de botella' :
        serverImpact > 25 ?
        'El servidor contribuye significativamente al tiempo de carga' :
        'El rendimiento está principalmente limitado por el frontend'
    };
  };

  const resourceEfficiency = getResourceEfficiency();
  const securityScore = getSecurityScore();
  const criticalIssues = getCriticalIssues();
  const correlation = getCorrelationAnalysis();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${healthStatus.color}`}>
                {avgScore}
              </div>
              <div className="text-sm text-gray-600">Puntuación General</div>
              <Badge className={`mt-2 ${healthStatus.bgColor} ${healthStatus.color}`}>
                {healthStatus.level}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {backendAnalysis.responseTime}ms
              </div>
              <div className="text-sm text-gray-600">Tiempo de Respuesta</div>
              <div className="text-xs text-gray-500 mt-1">Servidor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.firstContentfulPaint}ms
              </div>
              <div className="text-sm text-gray-600">Primer Contenido</div>
              <div className="text-xs text-gray-500 mt-1">Frontend</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Problemas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalIssues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{issue.issue}</span>
                      <Badge variant="destructive">{issue.severity}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{issue.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frontend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Análisis Frontend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Core Web Vitals</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">First Contentful Paint</span>
                    <Badge className={getCoreWebVitalStatus('firstContentfulPaint', metrics.firstContentfulPaint).color}>
                      {getCoreWebVitalStatus('firstContentfulPaint', metrics.firstContentfulPaint).status}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{metrics.firstContentfulPaint}ms</div>
                  <div className="text-xs text-gray-500">Tiempo hasta que aparece el primer contenido visual</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Largest Contentful Paint</span>
                    <Badge className={getCoreWebVitalStatus('largestContentfulPaint', metrics.largestContentfulPaint).color}>
                      {getCoreWebVitalStatus('largestContentfulPaint', metrics.largestContentfulPaint).status}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{metrics.largestContentfulPaint}ms</div>
                  <div className="text-xs text-gray-500">Tiempo hasta que se carga el elemento principal</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Blocking Time</span>
                    <Badge className={getCoreWebVitalStatus('totalBlockingTime', metrics.totalBlockingTime).color}>
                      {getCoreWebVitalStatus('totalBlockingTime', metrics.totalBlockingTime).status}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{metrics.totalBlockingTime}ms</div>
                  <div className="text-xs text-gray-500">Tiempo que la página está bloqueada para interacción</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cumulative Layout Shift</span>
                    <Badge className={getCoreWebVitalStatus('cumulativeLayoutShift', metrics.cumulativeLayoutShift).color}>
                      {getCoreWebVitalStatus('cumulativeLayoutShift', metrics.cumulativeLayoutShift).status}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{metrics.cumulativeLayoutShift.toFixed(3)}</div>
                  <div className="text-xs text-gray-500">Estabilidad visual durante la carga</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Eficiencia de Recursos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tamaño de Página</span>
                    <Badge className={getEfficiencyColor(resourceEfficiency.pageSizeEfficiency)}>
                      {resourceEfficiency.pageSizeEfficiency === 'excellent' ? 'Excelente' : 
                       resourceEfficiency.pageSizeEfficiency === 'good' ? 'Bueno' : 'Mejorable'}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{formatBytes(resourceDetails.pageSize)}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Número de Peticiones</span>
                    <Badge className={getEfficiencyColor(resourceEfficiency.requestEfficiency)}>
                      {resourceEfficiency.requestEfficiency === 'excellent' ? 'Excelente' : 
                       resourceEfficiency.requestEfficiency === 'good' ? 'Bueno' : 'Mejorable'}
                    </Badge>
                  </div>
                  <div className="text-lg font-medium">{resourceDetails.requestCount}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Infraestructura Backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Rendimiento del Servidor</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Tiempo de Respuesta</span>
                  <div className="text-lg font-medium">
                    {backendAnalysis.responseTime}ms
                  </div>
                  <Badge className={
                    backendAnalysis.responseTime < 200 ? 'text-green-600' :
                    backendAnalysis.responseTime < 500 ? 'text-blue-600' : 'text-red-600'
                  }>
                    {backendAnalysis.responseTime < 200 ? 'Excelente' :
                     backendAnalysis.responseTime < 500 ? 'Bueno' : 'Lento'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Tecnología</span>
                  <div className="text-lg font-medium">{backendAnalysis.serverTechnology}</div>
                  <div className="text-xs text-gray-500">{backendAnalysis.httpVersion}</div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Compresión</span>
                  <div className="flex items-center gap-2">
                    {backendAnalysis.compressionEnabled ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>{backendAnalysis.compressionEnabled ? 'Habilitada' : 'Deshabilitada'}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Seguridad</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Puntuación de Seguridad</span>
                  <div className="flex items-center gap-2">
                    <Progress value={securityScore} className="w-24" />
                    <span className="text-sm font-medium">{securityScore}/100</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'hasHTTPS', label: 'HTTPS', value: backendAnalysis.securityHeaders.hasHTTPS },
                    { key: 'hasHSTS', label: 'HSTS', value: backendAnalysis.securityHeaders.hasHSTS },
                    { key: 'hasCSP', label: 'CSP', value: backendAnalysis.securityHeaders.hasCSP },
                    { key: 'hasXFrameOptions', label: 'X-Frame-Options', value: backendAnalysis.securityHeaders.hasXFrameOptions }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center gap-2 text-sm">
                      {item.value ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Estrategia de Caché</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'hasCacheControl', label: 'Cache-Control', impact: 'Alto' },
                  { key: 'hasETag', label: 'ETag', impact: 'Medio' },
                  { key: 'hasLastModified', label: 'Last-Modified', impact: 'Bajo' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {backendAnalysis.cacheHeaders[item.key as keyof typeof backendAnalysis.cacheHeaders] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Correlation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Análisis de Correlación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Impacto del Servidor en el Frontend</h4>
              <div className="flex items-center gap-3">
                <Progress value={correlation.serverImpact} className="flex-1" />
                <span className="text-sm font-medium">{Math.round(correlation.serverImpact)}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{correlation.analysis}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Desglose de Tiempos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo del Servidor</span>
                    <span className="font-medium">{backendAnalysis.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Primer Contenido</span>
                    <span className="font-medium">{metrics.firstContentfulPaint}ms</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Elemento Principal</span>
                    <span className="font-medium">{metrics.largestContentfulPaint}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo Total</span>
                    <span className="font-medium">{resourceDetails.loadTime}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrated Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Recomendaciones Integradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, index) => (
                <div key={rec.id || index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant={
                          rec.impact === 'high' ? 'destructive' :
                          rec.impact === 'medium' ? 'default' : 'secondary'
                        }>
                          {rec.impact === 'high' ? 'Alto' : rec.impact === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      {rec.potentialSavings && (
                        <div className="text-xs text-green-600 mt-1">
                          💾 Posible ahorro: {rec.potentialSavings}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Detalles Técnicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Información del Análisis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">URL Analizada:</span>
                  <span className="text-right break-all">{analysis.url}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dispositivo:</span>
                  <span>{analysis.device === 'desktop' ? 'Escritorio' : 'Móvil'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha de Análisis:</span>
                  <span>{new Date(analysis.analyzedAt).toLocaleString('es-ES')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agente Ruby:</span>
                  <span>{backendAnalysis.serverTechnology !== 'Unknown' ? '✅ Utilizado' : '❌ No disponible'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Puntuaciones por Categoría</h4>
              <div className="space-y-3">
                {[
                  { label: 'Rendimiento', value: analysis.performanceScore },
                  { label: 'Accesibilidad', value: analysis.accessibilityScore },
                  { label: 'Mejores Prácticas', value: analysis.bestPracticesScore },
                  { label: 'SEO', value: analysis.seoScore }
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm w-24">{item.label}</span>
                    <Progress value={item.value} className="flex-1" />
                    <span className="text-sm font-medium w-8">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}