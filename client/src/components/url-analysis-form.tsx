import { useState } from "react";
import { Search, Dock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PerformanceAnalysis } from "@shared/schema";

interface UrlAnalysisFormProps {
  onAnalysisStart: () => void;
  onAnalysisSuccess: (analysis: PerformanceAnalysis) => void;
  onAnalysisError: (message: string) => void;
  disabled?: boolean;
}

export default function UrlAnalysisForm({
  onAnalysisStart,
  onAnalysisSuccess,
  onAnalysisError,
  disabled = false
}: UrlAnalysisFormProps) {
  const [url, setUrl] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const { toast } = useToast();

  const pollAnalysisResult = async (analysisId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = async (): Promise<PerformanceAnalysis> => {
      attempts++;
      
      try {
        const response = await apiRequest("GET", `/api/analysis/${analysisId}`);
        const analysis: PerformanceAnalysis = await response.json();

        if (analysis.status === "completed") {
          return analysis;
        } else if (analysis.status === "failed") {
          throw new Error(analysis.errorMessage || "Analysis failed");
        } else if (attempts >= maxAttempts) {
          throw new Error("Analysis timed out");
        } else {
          // Continue polling
          await new Promise(resolve => setTimeout(resolve, 5000));
          return poll();
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          throw new Error("Analysis timed out");
        }
        throw error;
      }
    };

    return poll();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      onAnalysisStart();

      // Start analysis
      const response = await apiRequest("POST", "/api/analyze", {
        url,
        device,
      });

      const { analysisId } = await response.json();

      // Poll for results
      const analysis = await pollAnalysisResult(analysisId);
      onAnalysisSuccess(analysis);

      toast({
        title: "Analysis Complete",
        description: "Website performance analysis has been completed successfully.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze website";
      onAnalysisError(message);
      
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          Analyze Website Performance
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a web page URL
            </Label>
            <div className="flex gap-3">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={disabled}
                required
              />
              <Button
                type="submit"
                disabled={disabled}
                className="bg-google-blue hover:bg-blue-700 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              Device Type
            </Label>
            <RadioGroup
              value={device}
              onValueChange={(value) => setDevice(value as "desktop" | "mobile")}
              className="flex items-center space-x-6"
              disabled={disabled}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="desktop" id="desktop" />
                <Label htmlFor="desktop" className="flex items-center text-sm text-gray-600">
                  <Dock className="w-4 h-4 mr-1" />
                  Dock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex items-center text-sm text-gray-600">
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Label>
              </div>
            </RadioGroup>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
