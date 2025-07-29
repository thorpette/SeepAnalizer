import { useState, useEffect } from "react";
import { Loader2, Globe, Server, Database, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function LoadingState() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const analysisSteps = [
    { icon: Globe, text: "Conectando al sitio web...", duration: 1000 },
    { icon: Server, text: "Analizando el backend y servidor...", duration: 1500 },
    { icon: Database, text: "Evaluando base de datos y rendimiento...", duration: 1000 },
    { icon: Search, text: "Calculando métricas de SEO y accesibilidad...", duration:1500 }
  ];

  useEffect(() => {
    const totalDuration = analysisSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsedTime = 0;

    const interval = setInterval(() => {
      elapsedTime += 100;
      const newProgress = Math.min((elapsedTime / totalDuration) * 100, 95);
      setProgress(newProgress);

      // Update current step
      let stepTime = 0;
      for (let i = 0; i < analysisSteps.length; i++) {
        stepTime += analysisSteps[i].duration;
        if (elapsedTime <= stepTime) {
          setCurrentStep(i);
          break;
        }
      }

      if (elapsedTime >= totalDuration) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = analysisSteps[currentStep]?.icon || Globe;

  return (
    <Card className="mb-8">
      <CardContent className="p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-google-blue rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analizando Rendimiento Completo
          </h3>
          <p className="text-gray-600 mb-6">
            Realizando análisis integral del frontend y backend...
          </p>
          
          <div className="w-80 mx-auto mb-6">
            <Progress value={progress} className="h-3 mb-2" />
            <div className="text-sm text-gray-500">{Math.round(progress)}% completado</div>
          </div>

          {/* Current Step Indicator */}
          <div className="flex items-center justify-center text-google-blue mb-4">
            <CurrentIcon className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">
              {analysisSteps[currentStep]?.text || "Finalizando análisis..."}
            </span>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2">
            {analysisSteps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    index <= currentStep
                      ? 'bg-google-blue border-google-blue text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
