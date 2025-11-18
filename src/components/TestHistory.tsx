import { useState } from "react";
import { History, TrendingDown, TrendingUp, Minus, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TestResultData } from "./TestResult";

interface TestHistoryProps {
  tests: TestResultData[];
  onExport?: () => void;
}

export const TestHistory = ({ tests, onExport }: TestHistoryProps) => {
  const [sortedTests] = useState(() => 
    [...tests].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case "safe": return "bg-success/10 text-success border-success/30";
      case "elevated": return "bg-warning/10 text-warning border-warning/30";
      case "high": return "bg-warning/10 text-warning border-warning/30";
      case "critical": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted/10 text-muted-foreground border-muted/30";
    }
  };

  const getTrend = (index: number) => {
    if (index === sortedTests.length - 1) return null;
    const current = sortedTests[index].concentration;
    const previous = sortedTests[index + 1].concentration;
    const diff = current - previous;
    
    if (Math.abs(diff) < 0.01) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
    return <TrendingDown className="h-4 w-4 text-success" />;
  };

  if (tests.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Test History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No tests recorded yet</p>
            <p className="text-sm mt-2">Your test history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Test History
          </CardTitle>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedTests.map((test, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={getLevelColor(test.level)}
                  >
                    {test.level.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {getTrend(index)}
                    <span className="text-sm text-muted-foreground">
                      {test.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {test.concentration.toFixed(2)} <span className="text-sm text-muted-foreground">ppm</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {test.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-sm font-medium text-foreground">{test.confidence}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
