import { AlertCircle, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export type AmmoniaLevel = "safe" | "elevated" | "high" | "critical";

export interface TestResultData {
  level: AmmoniaLevel;
  concentration: number;
  confidence: number;
  timestamp: Date;
  imageUrl?: string;
}

interface TestResultProps {
  result: TestResultData;
}

const levelConfig = {
  safe: {
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
    gradient: "bg-gradient-success",
    title: "Safe",
    description: "Ammonia levels are within safe range",
    range: "0-0.25 ppm",
  },
  elevated: {
    icon: AlertCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    gradient: "bg-gradient-warning",
    title: "Elevated",
    description: "Monitor closely and take preventive action",
    range: "0.25-0.5 ppm",
  },
  high: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    gradient: "bg-gradient-warning",
    title: "High",
    description: "Immediate action required to reduce levels",
    range: "0.5-1.0 ppm",
  },
  critical: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    gradient: "bg-gradient-danger",
    title: "Critical",
    description: "Dangerous levels - urgent intervention needed",
    range: ">1.0 ppm",
  },
};

export const TestResult = ({ result }: TestResultProps) => {
  const config = levelConfig[result.level];
  const Icon = config.icon;

  return (
    <Card className="shadow-medium border-2 border-border">
      <CardHeader className={`${config.gradient} text-white rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Icon className="h-8 w-8" />
            {config.title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
            {result.confidence}% confidence
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Concentration Display */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Ammonia Concentration</p>
          <p className="text-5xl font-bold text-foreground">
            {result.concentration.toFixed(2)}
            <span className="text-2xl text-muted-foreground ml-2">ppm</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Normal range: {config.range}
          </p>
        </div>

        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className="font-medium text-foreground">{result.confidence}%</span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        {/* Description */}
        <div className={`p-4 rounded-lg ${config.bg} border border-current/20`}>
          <p className={`text-sm font-medium ${config.color}`}>
            {config.description}
          </p>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Recommendations:</p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {result.level === "safe" && (
              <>
                <li>Continue regular monitoring</li>
                <li>Maintain current water quality practices</li>
              </>
            )}
            {result.level === "elevated" && (
              <>
                <li>Increase water change frequency</li>
                <li>Check filtration system</li>
                <li>Monitor daily for changes</li>
              </>
            )}
            {result.level === "high" && (
              <>
                <li>Perform immediate 50% water change</li>
                <li>Stop feeding temporarily</li>
                <li>Add beneficial bacteria</li>
                <li>Test again in 24 hours</li>
              </>
            )}
            {result.level === "critical" && (
              <>
                <li>Emergency water change (75-90%)</li>
                <li>Remove all uneaten food immediately</li>
                <li>Add ammonia neutralizer</li>
                <li>Consult aquarium specialist</li>
              </>
            )}
          </ul>
        </div>

        {/* Timestamp */}
        <div className="pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Test performed: {result.timestamp.toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
