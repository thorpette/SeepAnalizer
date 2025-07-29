import { Clock, Image, Timer, CornerLeftUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricsGridProps {
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return (ms / 1000).toFixed(1) + 's';
    }
    return Math.round(ms) + 'ms';
  };

  const getMetricStatus = (value: number, thresholds: [number, number]): string => {
    if (value <= thresholds[0]) return "Good";
    if (value <= thresholds[1]) return "Needs Improvement";
    return "Poor";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Good": return "text-success-green";
      case "Needs Improvement": return "text-warning-orange";
      case "Poor": return "text-error-red";
      default: return "text-gray-600";
    }
  };

  const metricsData = [
    {
      name: "First Contentful Paint",
      value: formatTime(metrics.firstContentfulPaint),
      status: getMetricStatus(metrics.firstContentfulPaint, [1800, 3000]),
      icon: Clock
    },
    {
      name: "Largest Contentful Paint",
      value: formatTime(metrics.largestContentfulPaint),
      status: getMetricStatus(metrics.largestContentfulPaint, [2500, 4000]),
      icon: Image
    },
    {
      name: "Total Blocking Time",
      value: formatTime(metrics.totalBlockingTime),
      status: getMetricStatus(metrics.totalBlockingTime, [200, 600]),
      icon: Timer
    },
    {
      name: "Cumulative Layout Shift",
      value: metrics.cumulativeLayoutShift.toFixed(3),
      status: getMetricStatus(metrics.cumulativeLayoutShift, [0.1, 0.25]),
      icon: CornerLeftUp
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">{metric.name}</h4>
              <metric.icon className="w-4 h-4 text-gray-400" />
            </div>
            <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
              {metric.value}
            </p>
            <p className={`text-sm ${getStatusColor(metric.status)}`}>
              {metric.status}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
