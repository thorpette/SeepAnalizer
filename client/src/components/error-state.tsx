import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-error-red mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Failed</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <Button 
            onClick={onRetry}
            className="bg-google-blue hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
