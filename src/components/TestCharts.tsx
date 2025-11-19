import { useState, useRef } from "react";
import { LineChart, TrendingUp, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TestResultData } from "./TestResult";
import html2canvas from "html2canvas";
import { toast } from "sonner";

interface TestChartsProps {
  tests: TestResultData[];
}

type ViewMode = "daily" | "weekly" | "monthly";

export const TestCharts = ({ tests }: TestChartsProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const chartRef = useRef<HTMLDivElement>(null);

  if (tests.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Ammonia Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No data to visualize yet</p>
            <p className="text-sm mt-2">Complete tests to see trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupDataByView = (data: TestResultData[], mode: ViewMode) => {
    const sorted = [...data].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    if (mode === "daily") {
      return sorted.map(test => ({
        date: test.timestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: test.timestamp.getTime(),
        concentration: test.concentration,
        level: test.level,
      }));
    }

    const grouped = new Map<string, { sum: number; count: number; levels: string[] }>();

    sorted.forEach(test => {
      let key: string;
      if (mode === "weekly") {
        const weekStart = new Date(test.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        key = test.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      }

      if (!grouped.has(key)) {
        grouped.set(key, { sum: 0, count: 0, levels: [] });
      }
      const entry = grouped.get(key)!;
      entry.sum += test.concentration;
      entry.count += 1;
      entry.levels.push(test.level);
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      timestamp: 0,
      concentration: data.sum / data.count,
      level: data.levels[Math.floor(data.levels.length / 2)],
    }));
  };

  const calculateTrendLine = (data: { timestamp: number; concentration: number }[]) => {
    if (data.length < 2) return data;

    const n = data.length;
    const sumX = data.reduce((sum, d, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.concentration, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.concentration, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      ...d,
      trend: slope * i + intercept,
    }));
  };

  const chartData = groupDataByView(tests, viewMode);
  const dataWithTrend = calculateTrendLine(chartData);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "safe": return "hsl(var(--success))";
      case "elevated": return "hsl(var(--warning))";
      case "high": return "hsl(var(--warning))";
      case "critical": return "hsl(var(--destructive))";
      default: return "hsl(var(--muted-foreground))";
    }
  };

  const exportChart = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ammonia-chart-${viewMode}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();

      toast.success("Chart exported successfully");
    } catch (error) {
      toast.error("Failed to export chart");
    }
  };

  const avgConcentration = (chartData.reduce((sum, d) => sum + d.concentration, 0) / chartData.length).toFixed(2);
  const maxConcentration = Math.max(...chartData.map(d => d.concentration)).toFixed(2);
  const minConcentration = Math.min(...chartData.map(d => d.concentration)).toFixed(2);

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Ammonia Trends
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="daily" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Daily
                </TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Monthly
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" size="sm" onClick={exportChart}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Average</span>
            <span className="text-lg font-bold text-foreground">{avgConcentration} ppm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Maximum</span>
            <span className="text-lg font-bold text-destructive">{maxConcentration} ppm</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Minimum</span>
            <span className="text-lg font-bold text-success">{minConcentration} ppm</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div ref={chartRef} className="w-full bg-card p-4 rounded-lg">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dataWithTrend}>
              <defs>
                <linearGradient id="colorConcentration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                label={{ value: 'Concentration (ppm)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Concentration") return [`${value.toFixed(2)} ppm`, name];
                  if (name === "Trend") return [`${value.toFixed(2)} ppm`, name];
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Area 
                type="monotone" 
                dataKey="concentration" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorConcentration)"
                strokeWidth={3}
                name="Concentration"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="trend" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Trend"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              Safe: 0-0.5 ppm
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              Elevated: 0.5-2 ppm
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              High: 2-5 ppm
            </Badge>
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              Critical: &gt;5 ppm
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
