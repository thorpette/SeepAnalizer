import { FileText, ArrowRightLeft, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ResourceDetailsProps {
  resourceDetails: {
    pageSize: number;
    requestCount: number;
    loadTime: number;
  };
}

export default function ResourceDetails({ resourceDetails }: ResourceDetailsProps) {
  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resource Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {formatFileSize(resourceDetails.pageSize)}
            </p>
            <p className="text-sm text-gray-600">Total Page Size</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ArrowRightLeft className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {resourceDetails.requestCount}
            </p>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {formatTime(resourceDetails.loadTime)}
            </p>
            <p className="text-sm text-gray-600">Load Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
