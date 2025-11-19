import { useState, useEffect } from "react";
import { X, Save, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { setRoboflowConfig, isConfigured, getRoboflowConfig } from "@/utils/roboflowService";
import { setTestStripExpiration, getTestStripInfo, clearTestStripExpiration } from "@/utils/testStripService";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";

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
  const [expirationDate, setExpirationDate] = useState("");
  const [errors, setErrors] = useState<{ apiKey?: string; modelEndpoint?: string; expirationDate?: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    const config = getRoboflowConfig();
    if (config) {
      setApiKey(config.apiKey);
      setModelEndpoint(config.modelEndpoint);
    }

    const stripInfo = getTestStripInfo();
    if (stripInfo) {
      const date = new Date(stripInfo.expirationDate);
      setExpirationDate(format(date, "yyyy-MM-dd"));
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

  const handleSaveExpiration = () => {
    if (!expirationDate) {
      setErrors({ ...errors, expirationDate: "Expiration date is required" });
      return;
    }

    const date = new Date(expirationDate);
    if (date < new Date()) {
      setErrors({ ...errors, expirationDate: "Expiration date cannot be in the past" });
      return;
    }

    setTestStripExpiration(date);
    setErrors({ ...errors, expirationDate: undefined });

    toast({
      title: "Expiration Date Saved",
      description: `Test strips will expire on ${format(date, "MMM dd, yyyy")}`,
    });
  };

  const handleClearExpiration = () => {
    setExpirationDate("");
    clearTestStripExpiration();
    
    toast({
      title: "Expiration Date Cleared",
      description: "Test strip tracking has been reset.",
    });
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

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Test Strip Expiration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your test strip expiration date to ensure accurate results
            </p>

            <div className="space-y-2">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Input
                id="expirationDate"
                type="date"
                value={expirationDate}
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  setErrors({ ...errors, expirationDate: undefined });
                }}
                min={format(new Date(), "yyyy-MM-dd")}
                className={errors.expirationDate ? "border-destructive" : ""}
              />
              {errors.expirationDate && (
                <p className="text-sm text-destructive">{errors.expirationDate}</p>
              )}
              {expirationDate && !errors.expirationDate && (
                <p className="text-sm text-muted-foreground">
                  Expires on {format(new Date(expirationDate), "MMMM dd, yyyy")}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveExpiration} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save Expiration Date
              </Button>
              <Button
                variant="outline"
                onClick={handleClearExpiration}
                disabled={!expirationDate}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
