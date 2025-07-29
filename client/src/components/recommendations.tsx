import { Lightbulb, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  potentialSavings?: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return AlertTriangle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      default: return Info;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-error-red';
      case 'medium': return 'text-google-blue';
      case 'low': return 'text-success-green';
      default: return 'text-gray-400';
    }
  };

  const getBorderColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-error-red bg-red-50';
      case 'medium': return 'border-google-blue bg-blue-50';
      case 'low': return 'border-success-green bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-success-green mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Great Job! No Major Issues Found
            </h3>
            <p className="text-gray-600">
              Your website is performing well with no critical optimization recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 text-warning-orange mr-2" />
          Optimization Recommendations
        </h3>
        
        <div className="space-y-4">
          {recommendations.map((recommendation) => {
            const IconComponent = getImpactIcon(recommendation.impact);
            
            return (
              <div
                key={recommendation.id}
                className={`border-l-4 p-4 ${getBorderColor(recommendation.impact)}`}
              >
                <div className="flex items-start">
                  <IconComponent 
                    className={`w-5 h-5 mt-1 mr-3 ${getImpactColor(recommendation.impact)}`} 
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {recommendation.title}
                    </h4>
                    <p className="text-gray-700 mb-2">
                      {recommendation.description}
                      {recommendation.potentialSavings && (
                        <span className="font-medium">
                          {' '}Potential savings: {recommendation.potentialSavings}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(recommendation.impact) as any}>
                        {recommendation.impact.charAt(0).toUpperCase() + recommendation.impact.slice(1)} Impact
                      </Badge>
                      <Badge variant="outline">
                        {recommendation.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
