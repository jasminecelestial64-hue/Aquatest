import { useState } from "react";
import { History, TrendingDown, TrendingUp, Minus, Download, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
import { TestResultData } from "./TestResult";

interface TestHistoryProps {
  tests: TestResultData[];
  onExport?: () => void;
}

export const TestHistory = ({ tests, onExport }: TestHistoryProps) => {
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTests = tests
    .filter(test => {
      const matchesLevel = filterLevel === "all" || test.level === filterLevel;
      const matchesSearch = test.concentration.toString().includes(searchTerm);
      return matchesLevel && matchesSearch;
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const sortedTests = filteredTests; // For trend calculation logic consistency

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
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Test History
            </CardTitle>
            <div className="flex gap-2">
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search concentration..."
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-[150px] bg-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="safe">Safe</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTests.map((test, index) => (
              <Card
                key={index}
                className="border border-border bg-card hover:shadow-glow hover:border-primary/50 transition-all cursor-default group"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`${getLevelColor(test.level)} px-2 py-0.5`}
                    >
                      {test.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {test.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-3xl font-bold text-foreground">
                      {test.concentration.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground ml-1">ppm</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {test.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrend(index)}
                      <span>{test.confidence}% Conf.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
