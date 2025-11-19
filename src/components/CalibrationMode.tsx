import { useState } from "react";
import { Camera, X, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CameraCapture } from "./CameraCapture";
import {
  CalibrationSample,
  saveCalibrationSample,
  getCalibrationSamples,
  clearCalibration,
  deleteCalibrationSample,
  extractColorProfile,
} from "@/utils/calibrationService";
import { analyzeImage } from "@/utils/roboflowService";
import { useToast } from "@/hooks/use-toast";

interface CalibrationModeProps {
  onClose: () => void;
}

export const CalibrationMode = ({ onClose }: CalibrationModeProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [knownConcentration, setKnownConcentration] = useState("");
  const [samples, setSamples] = useState<CalibrationSample[]>(getCalibrationSamples());
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCapture = async (imageData: string) => {
    setShowCamera(false);
    
    if (!knownConcentration || isNaN(parseFloat(knownConcentration))) {
      toast({
        title: "Invalid Concentration",
        description: "Please enter a valid concentration value before capturing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await analyzeImage(imageData);
      const colorProfile = await extractColorProfile(imageData);

      const sample: CalibrationSample = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        knownConcentration: parseFloat(knownConcentration),
        imageData,
        rawPrediction: result.concentration,
        colorProfile,
      };

      saveCalibrationSample(sample);
      setSamples(getCalibrationSamples());
      setKnownConcentration("");

      toast({
        title: "Calibration Sample Added",
        description: `Reference sample at ${sample.knownConcentration} mg/L saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process calibration sample.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteCalibrationSample(id);
    setSamples(getCalibrationSamples());
    toast({
      title: "Sample Deleted",
      description: "Calibration sample removed successfully.",
    });
  };

  const handleClearAll = () => {
    clearCalibration();
    setSamples([]);
    toast({
      title: "Calibration Reset",
      description: "All calibration data has been cleared.",
    });
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calibration Mode</h1>
            <p className="text-muted-foreground mt-1">
              Improve accuracy by adding reference samples
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Calibration Sample</CardTitle>
            <CardDescription>
              Capture a photo of a test strip with a known ammonia concentration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="concentration">Known Concentration (mg/L)</Label>
                <Input
                  id="concentration"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 0.5"
                  value={knownConcentration}
                  onChange={(e) => setKnownConcentration(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => setShowCamera(true)}
                disabled={!knownConcentration || isProcessing}
                className="w-full"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture Reference Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calibration Samples</CardTitle>
                <CardDescription>
                  {samples.length} reference sample{samples.length !== 1 ? "s" : ""} stored
                </CardDescription>
              </div>
              {samples.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {samples.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No calibration samples yet</p>
                <p className="text-sm mt-2">Add reference photos to improve accuracy</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <img
                      src={sample.imageData}
                      alt="Calibration sample"
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Known Value:</span>
                        <Badge variant="outline">
                          {sample.knownConcentration.toFixed(2)} mg/L
                        </Badge>
                      </div>
                      {sample.rawPrediction !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Model Prediction:</span>
                          <span className="text-sm">
                            {sample.rawPrediction.toFixed(2)} mg/L
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="text-sm">
                          {new Date(sample.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sample.id)}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">How Calibration Works</p>
              <p className="text-sm text-muted-foreground mt-1">
                By capturing reference photos with known concentrations, the app learns to correct
                for lighting conditions and indicator variations. For best results, add 3-5 samples
                across different concentration ranges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
