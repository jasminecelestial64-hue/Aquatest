import { useState, useRef, useEffect } from "react";
import { Camera, Upload, Image as ImageIcon, Bell, Loader2, Info, CheckCircle2, AlertCircle, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CameraCapture } from "@/components/CameraCapture";
import { TestHistory } from "@/components/TestHistory";
import { TestResult, TestResultData } from "@/components/TestResult";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Layout } from "@/components/Layout";
import { runInference, drawDetections } from "@/utils/onnxService";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const Index = () => {
  const [view, setView] = useState<'home' | 'settings' | 'history'>('home');
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResultData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [testHistory, setTestHistory] = useState<TestResultData[]>([]);
  const [showTips, setShowTips] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const { addNotification } = useNotifications();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (currentResult && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        drawDetections(canvas, currentResult.detections);
      };
      img.src = currentResult.imageUrl!;
    }
  }, [currentResult, view]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        handleAnalyze(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = (imageData: string) => {
    setShowCamera(false);
    handleAnalyze(imageData);
  };

  const handleAnalyze = async (imageData: string) => {
    setIsAnalyzing(true);
    setCurrentResult(null);
    try {
      const result = await runInference(imageData);
      const testResult: TestResultData = {
        ...result,
        timestamp: new Date(),
        imageUrl: imageData,
      };
      setCurrentResult(testResult);
      setTestHistory(prev => [testResult, ...prev]);

      toast({
        title: "Analysis complete!",
        description: `Ammonia level: ${result.level} (${result.concentration.toFixed(2)} ppm)`,
      });

      if (result.level === "safe") {
        addNotification("success", "Safe", "Ammonia level is safe.");
      } else if (result.level === "elevated") {
        addNotification("warning", "Elevated", "Ammonia level is elevated.");
      } else {
        addNotification("error", "High/Critical", `Ammonia level is ${result.level}!`);
      }
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(testHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aquatest-history-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export Complete",
      description: "Test history downloaded successfully",
    });
  };

  const renderContent = () => {
    if (view === 'settings') return <SettingsPanel onClose={() => setView('home')} />;
    if (view === 'history') return <TestHistory tests={testHistory} onExport={handleExport} />;

    // Home view - matching screenshot
    return (
      <div className="h-full flex flex-col">
        {/* Top bar with notification and user */}
        <div className="flex justify-end items-center p-4 gap-4">
          <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 dark:border-slate-700 shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{user?.email || 'Guest User'}</span>
            </div>
            <Avatar className="h-8 w-8 border-2 border-cyan-200 dark:border-cyan-800">
              <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white text-xs">
                {user?.email?.charAt(0).toUpperCase() || 'G'}
              </AvatarFallback>
            </Avatar>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-white/40 dark:border-slate-700 shadow-sm hover:bg-white/80 dark:hover:bg-slate-700">
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900"></span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden translate-y-2 border-slate-200 dark:border-slate-800" align="end">
              <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="h-auto p-0 text-[10px] text-cyan-600 dark:text-cyan-400 hover:bg-transparent">
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-600">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y dark:divide-slate-800">
                    {notifications.map((n) => (
                      <div key={n.id} className={cn("p-4 transition-colors", !n.read ? "bg-cyan-50/50 dark:bg-cyan-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-900/50")}>
                        <div className="flex gap-3">
                          <div className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0",
                            n.type === 'success' ? 'bg-green-500' :
                              n.type === 'warning' ? 'bg-amber-500' :
                                n.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          )} />
                          <div className="flex-1">
                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">{n.title}</p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-2 border-t dark:border-slate-800 text-center">
                  <Button variant="ghost" size="sm" onClick={() => clearAll()} className="w-full h-8 text-[10px] text-slate-400 hover:text-red-500">
                    Clear All
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Main content area - 2 column layout */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl">
            {/* Left side - Main content */}
            <div className="flex flex-col items-center justify-center space-y-8 text-center lg:text-left">
              {showTips && (
                <Card className="w-full bg-cyan-500/10 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800 shadow-none animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-cyan-200 dark:hover:bg-cyan-800" onClick={() => setShowTips(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="p-4 flex gap-4">
                    <div className="bg-cyan-100 dark:bg-cyan-900/50 p-2 rounded-lg h-fit">
                      <Info className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-cyan-800 dark:text-cyan-200 text-sm">Session Tip: Better Analysis</p>
                      <p className="text-xs text-cyan-700 dark:text-cyan-300 leading-relaxed">
                        For accurate results, ensure your sample is well-lit and the test strip is held flat against a solid background. Avoid shadows and glare on the water surface.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <h1 className="text-5xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">AquaTest</h1>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowCamera(true)}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg"
                >
                  <Camera className="mr-2 h-5 w-5" />
                  Capture Analysis
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 px-8 rounded-full border-2 border-slate-300 hover:bg-slate-50"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload
                </Button>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            {/* Right side - Analysis card */}
            <div className="flex items-center justify-center">
              {isAnalyzing ? (
                <Card className="w-full max-w-md shadow-lg h-[400px]">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-cyan-500 animate-spin" />
                    <div>
                      <p className="font-semibold text-slate-800">Analyzing Image...</p>
                      <p className="text-sm text-slate-500">Wait a moment while we process the water sample.</p>
                    </div>
                  </CardContent>
                </Card>
              ) : currentResult ? (
                <Card className="w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="relative group cursor-pointer" onClick={() => setShowReasoning(!showReasoning)}>
                    <canvas
                      ref={canvasRef}
                      className="w-full h-48 object-cover border-b"
                      title="Click to see why this image was accepted"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Info className="text-white opacity-0 group-hover:opacity-100 h-8 w-8" />
                    </div>
                    {showReasoning && (
                      <div className="absolute inset-0 bg-white/95 p-6 flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom duration-200 overflow-y-auto">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                        <p className="font-bold text-slate-800">Inference Details</p>
                        <div className="text-xs text-slate-600 space-y-2 mt-2">
                          <p>We found <span className="font-bold text-cyan-600">{currentResult.detections.length}</span> potential markers in this image.</p>
                          <p>The primary signal detected was <span className="font-bold text-slate-800 capitalize">{currentResult.level}</span> level ammonia with <span className="font-bold text-slate-800">{currentResult.confidence}%</span> certainty.</p>
                          <p className="italic border-t pt-2">Reasoning: Color profile significantly matches {currentResult.level} reference benchmarks after ambient light calibration.</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-4 text-xs font-semibold hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReasoning(false);
                          }}
                        >
                          Close Explanation
                        </Button>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Result</p>
                        <p className="text-2xl font-bold text-slate-800 capitalize">{currentResult.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</p>
                        <p className="text-xl font-semibold text-cyan-600">{currentResult.confidence}%</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${currentResult.level === 'safe' ? 'bg-green-500' :
                        currentResult.level === 'elevated' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                      <p className="text-sm font-medium text-slate-700">
                        {currentResult.concentration.toFixed(2)} ppm ammonia detected
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Dialog open={showDetails} onOpenChange={setShowDetails}>
                        <DialogTrigger asChild>
                          <Button className="flex-1 rounded-full bg-slate-800 hover:bg-slate-900 text-white">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Full Analysis Result</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <TestResult result={currentResult} />
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        className="rounded-full px-4"
                        onClick={() => setCurrentResult(null)}
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="w-full max-w-md shadow-lg h-[400px]">
                  <CardContent className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 mb-1">No recent analysis</p>
                      <p className="text-sm text-slate-500">Start by capturing or uploading a photo.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout activeView={view} onNavigate={setView}>
      {renderContent()}

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Layout>
  );
};

export default Index;
