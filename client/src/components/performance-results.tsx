import { PerformanceAnalysis } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import CircularChart from "./circular-chart";
import MetricsGrid from "./metrics-grid";
import ResourceDetails from "./resource-details";
import BackendAnalysis from "./backend-analysis";
import TimelineChart from "./timeline-chart";
import Recommendations from "./recommendations";

interface PerformanceResultsProps {
  analysis: PerformanceAnalysis;
}

export default function PerformanceResults({ analysis }: PerformanceResultsProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-success-green";
    if (score >= 50) return "text-warning-orange";
    return "text-error-red";
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return "Bueno";
    if (score >= 50) return "Necesita Mejora";
    return "Pobre";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-gray-900">Performance Results</h2>
            <div className="text-sm text-gray-500">
              Analyzed: {formatDate(analysis.analyzedAt)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Performance Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <CircularChart score={analysis.performanceScore} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.performanceScore)}`}>
                    {analysis.performanceScore}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Rendimiento</h3>
              <p className={`text-sm ${getScoreColor(analysis.performanceScore)}`}>
                {getScoreLabel(analysis.performanceScore)}
              </p>
            </div>

            {/* Accessibility Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <CircularChart score={analysis.accessibilityScore} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.accessibilityScore)}`}>
                    {analysis.accessibilityScore}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Accesibilidad</h3>
              <p className={`text-sm ${getScoreColor(analysis.accessibilityScore)}`}>
                {getScoreLabel(analysis.accessibilityScore)}
              </p>
            </div>

            {/* Best Practices Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <CircularChart score={analysis.bestPracticesScore} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.bestPracticesScore)}`}>
                    {analysis.bestPracticesScore}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">Mejores Prácticas</h3>
              <p className={`text-sm ${getScoreColor(analysis.bestPracticesScore)}`}>
                {getScoreLabel(analysis.bestPracticesScore)}
              </p>
            </div>

            {/* SEO Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <CircularChart score={analysis.seoScore} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                    {analysis.seoScore}
                  </span>
                </div>
              </div>
              <h3 className="font-medium text-gray-900">SEO</h3>
              <p className={`text-sm ${getScoreColor(analysis.seoScore)}`}>
                {getScoreLabel(analysis.seoScore)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <MetricsGrid metrics={analysis.metrics} />

      {/* Resource Details */}
      <ResourceDetails resourceDetails={analysis.resourceDetails} />

      {/* Backend Analysis */}
      <BackendAnalysis backendAnalysis={analysis.backendAnalysis} />

      {/* Timeline Chart */}
      <TimelineChart timelineData={analysis.timelineData} />

      {/* Recommendations */}
      <Recommendations recommendations={analysis.recommendations} />
    </div>
  );
}
