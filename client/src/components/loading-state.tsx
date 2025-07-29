import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function LoadingState() {
  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-google-blue rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analyzing Performance
          </h3>
          <p className="text-gray-600 mb-4">
            Please wait while we analyze your website...
          </p>
          <div className="w-64 mx-auto">
            <Progress value={60} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
