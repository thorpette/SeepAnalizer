import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineChartProps {
  timelineData: Array<{ time: number; progress: number }>;
}

export default function TimelineChart({ timelineData }: TimelineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !timelineData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set styles
    ctx.strokeStyle = '#1976D2';
    ctx.fillStyle = 'rgba(25, 118, 210, 0.1)';
    ctx.lineWidth = 2;

    // Calculate scales
    const maxTime = Math.max(...timelineData.map(d => d.time));
    const xScale = width / maxTime;
    const yScale = height / 100;

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (progress)
    for (let i = 0; i <= 100; i += 25) {
      const y = padding + height - (i * yScale);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();
    }

    // Vertical grid lines (time)
    const timeSteps = 5;
    for (let i = 0; i <= timeSteps; i++) {
      const x = padding + (i * width / timeSteps);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + height);
      ctx.stroke();
    }

    // Draw filled area
    ctx.fillStyle = 'rgba(25, 118, 210, 0.1)';
    ctx.beginPath();
    ctx.moveTo(padding, padding + height);
    
    timelineData.forEach((point, index) => {
      const x = padding + (point.time * xScale);
      const y = padding + height - (point.progress * yScale);
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.lineTo(padding + width, padding + height);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    timelineData.forEach((point, index) => {
      const x = padding + (point.time * xScale);
      const y = padding + height - (point.progress * yScale);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (time)
    for (let i = 0; i <= timeSteps; i++) {
      const x = padding + (i * width / timeSteps);
      const time = (i * maxTime / timeSteps / 1000).toFixed(1);
      ctx.fillText(`${time}s`, x, canvas.height - 10);
    }

    // Y-axis labels (progress)
    ctx.textAlign = 'right';
    for (let i = 0; i <= 100; i += 25) {
      const y = padding + height - (i * yScale) + 4;
      ctx.fillText(`${i}%`, padding - 10, y);
    }
  }, [timelineData]);

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Loading Timeline</h3>
        <div className="h-64 w-full">
          <canvas
            ref={canvasRef}
            width={800}
            height={256}
            className="w-full h-full"
            style={{ maxWidth: '100%' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
