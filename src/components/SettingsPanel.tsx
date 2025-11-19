import { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setRoboflowConfig, isConfigured, getRoboflowConfig } from "@/utils/roboflowService";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

interface SettingsPanelProps {
  onClose: () => void;
}

const configSchema = z.object({
  apiKey: z.string().trim().min(1, "API key is required"),
  modelEndpoint: z.string().trim().url("Must be a valid URL").min(1, "Model endpoint is required"),
});

export const SettingsPanel = ({ onClose }: SettingsPanelProps) => {
  const [apiKey, setApiKey] = useState("");
  const [modelEndpoint, setModelEndpoint] = useState("");
  const [errors, setErrors] = useState<{ apiKey?: string; modelEndpoint?: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    const config = getRoboflowConfig();
    if (config) {
      setApiKey(config.apiKey);
      setModelEndpoint(config.modelEndpoint);
    }
  }, []);

  const handleSave = () => {
    setErrors({});

    const result = configSchema.safeParse({
      apiKey: apiKey.trim(),
      modelEndpoint: modelEndpoint.trim(),
    });

    if (!result.success) {
      const fieldErrors: { apiKey?: string; modelEndpoint?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "apiKey") fieldErrors.apiKey = err.message;
        if (err.path[0] === "modelEndpoint") fieldErrors.modelEndpoint = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setRoboflowConfig({
      apiKey: apiKey.trim(),
      modelEndpoint: modelEndpoint.trim(),
    });

    toast({
      title: "Settings Saved",
      description: "Roboflow configuration updated successfully.",
    });

    onClose();
  };

  const handleClear = () => {
    setApiKey("");
    setModelEndpoint("");
    setRoboflowConfig({ apiKey: "", modelEndpoint: "" });
    
    toast({
      title: "Configuration Cleared",
      description: "Roboflow settings have been reset.",
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Roboflow Configuration</CardTitle>
              <CardDescription>
                Configure your Roboflow API credentials for real-time ammonia detection
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your API credentials are stored locally on your device and never sent to any server.
              For production apps with multiple users, consider using Lovable Cloud for secure credential management.
            </AlertDescription>
          </Alert>

          {isConfigured() && (
            <Alert className="bg-primary/10 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                Roboflow is currently configured and ready to use.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Roboflow API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={errors.apiKey ? "border-destructive" : ""}
              />
              {errors.apiKey && (
                <p className="text-sm text-destructive">{errors.apiKey}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Find your API key in your Roboflow dashboard under Settings → API Keys
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelEndpoint">Model Endpoint</Label>
              <Input
                id="modelEndpoint"
                type="url"
                placeholder="https://detect.roboflow.com/your-model/version"
                value={modelEndpoint}
                onChange={(e) => setModelEndpoint(e.target.value)}
                className={errors.modelEndpoint ? "border-destructive" : ""}
              />
              {errors.modelEndpoint && (
                <p className="text-sm text-destructive">{errors.modelEndpoint}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Example: https://detect.roboflow.com/ammonia-detector/1
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">How to get your credentials:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Go to your Roboflow project dashboard</li>
              <li>Navigate to the trained model version you want to use</li>
              <li>Click on "Deploy" → "Hosted API"</li>
              <li>Copy the API endpoint URL and your API key</li>
              <li>Paste them above and click Save</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
            <Button onClick={handleClear} variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
