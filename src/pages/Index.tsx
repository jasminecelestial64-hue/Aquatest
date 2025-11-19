import { useState } from "react";
import { Camera, Settings, History, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CameraCapture } from "@/components/CameraCapture";
import { TestResult, TestResultData } from "@/components/TestResult";
import { TestHistory } from "@/components/TestHistory";
import { TestCharts } from "@/components/TestCharts";
import { analyzeImage, applyWhiteBalanceCorrection, isConfigured } from "@/utils/roboflowService";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResultData | null>(null);
  const [testHistory, setTestHistory] = useState<TestResultData[]>([]);
  const { toast } = useToast();

  const handleCapture = async (imageData: string) => {
    setShowCamera(false);
    setIsAnalyzing(true);

    try {
      // Apply white balance correction for better accuracy
      const correctedImage = await applyWhiteBalanceCorrection(imageData);
      
      // Analyze with Roboflow model
      const result = await analyzeImage(correctedImage);
      
      const testResult: TestResultData = {
        ...result,
        timestamp: new Date(),
        imageUrl: imageData,
      };

      setCurrentResult(testResult);
      setTestHistory(prev => [testResult, ...prev]);

      if (!isConfigured()) {
        toast({
          title: "Demo Mode",
          description: "Using mock data. Configure Roboflow API to get real results.",
          variant: "default",
        });
      } else {
        toast({
          title: "Analysis Complete",
          description: `Ammonia level: ${result.level.toUpperCase()}`,
          variant: result.level === "safe" ? "default" : "destructive",
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
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
    link.download = `ammonia-test-history-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Test history downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-ocean flex items-center justify-center">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AquaTest Pro</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Ammonia Detection</p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {isAnalyzing ? (
          <Card className="shadow-medium">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div>
                  <p className="text-lg font-semibold text-foreground">Analyzing Image</p>
                  <p className="text-sm text-muted-foreground mt-1">Processing with AI model...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : currentResult ? (
          <div className="space-y-6">
            <TestResult result={currentResult} />
            
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => setShowCamera(true)}
                className="flex-1 bg-gradient-ocean border-0"
              >
                <Camera className="mr-2 h-5 w-5" />
                Test Again
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentResult(null)}
                className="flex-1"
              >
                <History className="mr-2 h-5 w-5" />
                View History
              </Button>
            </div>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="info">About</TabsTrigger>
              </TabsList>
              <TabsContent value="history">
                <TestHistory tests={testHistory} onExport={handleExport} />
              </TabsContent>
              <TabsContent value="info">
                <Card className="shadow-soft">
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">How It Works</h3>
                      <p className="text-sm text-muted-foreground">
                        AquaTest Pro uses advanced computer vision to analyze color changes in ammonia test strips.
                        Simply capture a photo of your test strip, and our AI model will provide instant results.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Tips for Accurate Results</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Use good lighting conditions</li>
                        <li>Align the test strip within the camera guides</li>
                        <li>Ensure the strip is fully visible</li>
                        <li>Wait for color to fully develop before testing</li>
                        <li>Keep the camera steady during capture</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="shadow-medium border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-ocean flex items-center justify-center shadow-strong">
                    <Camera className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome to AquaTest Pro
                    </h2>
                    <p className="text-muted-foreground">
                      Professional ammonia testing powered by AI
                    </p>
                  </div>
                  
                  {!isConfigured() && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-left">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-warning mb-1">Demo Mode</p>
                          <p className="text-muted-foreground">
                            Configure your Roboflow API key in settings to use your trained model.
                            Currently showing demo results.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    size="lg"
                    onClick={() => setShowCamera(true)}
                    className="w-full bg-gradient-ocean border-0 shadow-medium hover:shadow-strong transition-all"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Start New Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* History Section */}
            {testHistory.length > 0 && (
              <>
                <TestCharts tests={testHistory} />
                <TestHistory tests={testHistory} onExport={handleExport} />
              </>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <Info className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Quick & Accurate</h3>
                      <p className="text-sm text-muted-foreground">
                        Get instant results with lab-grade accuracy using AI-powered analysis
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <History className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Track Over Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Monitor trends and export your complete testing history
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default Index;
