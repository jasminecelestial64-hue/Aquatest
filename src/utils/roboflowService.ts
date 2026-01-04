import { AmmoniaLevel } from "@/components/TestResult";
import { runInference } from "./onnxService";
import { setRoboflowConfig as updateConfig, getRoboflowConfig as getConfig } from "./onnxService"; // If we want to keep config mock or remove it

// Keep types for backward compatibility if needed, though they aren't exported heavily
export interface RoboflowPrediction {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// We can keep these stubbed or remove if unused. The app checks allowConfig.
// Local inference doesn't need API keys, so we can make isConfigured always true or remove the check.
// For minimal friction, we'll make isConfigured always return true.

export const isConfigured = () => true;

// These are now no-ops or deprecated but kept to prevent build errors if components call them
// We can remove them if we are sure no one uses them, but safely redirecting is better.
export const setRoboflowConfig = (config: any) => {
  console.log("Roboflow config set (ignored for local inference)", config);
};

export const getRoboflowConfig = () => {
  return { apiKey: "local", modelEndpoint: "local" };
};

/**
 * Analyzes an image using the Local ONNX model (formerly Roboflow)
 * @param imageData Base64 encoded image data
 * @returns Analysis results with ammonia level and concentration
 */
export const analyzeImage = async (imageData: string): Promise<{
  level: AmmoniaLevel;
  concentration: number;
  confidence: number;
  rawPredictions?: any[];
}> => {
  try {
    const result = await runInference(imageData);

    // Map onnxService result to expected format
    return {
      level: result.level,
      concentration: result.concentration,
      confidence: result.confidence,
      // Convert detections to "rawPredictions" format if components rely on it (e.g. for debugging overlay)
      rawPredictions: result.detections.map(d => ({
        class: d.label,
        confidence: d.score,
        x: d.box[0] + d.box[2] / 2, // Convert top-left back to center for compatibility if needed? 
        // Actually, components likely use these generic props. 
        // Let's check usage if we can, but for now we'll match the interface.
        // Roboflow prediction: x,y is center. width, height.
        // Our ONNX: box is [x, y, w, h] (top-left)
        // So:
        y: d.box[1] + d.box[3] / 2,
        width: d.box[2],
        height: d.box[3]
      }))
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Applies white balance correction to image before analysis
 * This improves color accuracy under different lighting conditions
 */
export const applyWhiteBalanceCorrection = async (imageData: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(imageData);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      // Calculate average RGB values
      let sumR = 0, sumG = 0, sumB = 0;
      for (let i = 0; i < data.length; i += 4) {
        sumR += data[i];
        sumG += data[i + 1];
        sumB += data[i + 2];
      }

      const pixelCount = data.length / 4;
      const avgR = sumR / pixelCount;
      const avgG = sumG / pixelCount;
      const avgB = sumB / pixelCount;
      const avg = (avgR + avgG + avgB) / 3;

      // Apply correction
      const scaleR = avg / avgR;
      const scaleG = avg / avgG;
      const scaleB = avg / avgB;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] * scaleR);
        data[i + 1] = Math.min(255, data[i + 1] * scaleG);
        data[i + 2] = Math.min(255, data[i + 2] * scaleB);
      }

      ctx.putImageData(imageDataObj, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.src = imageData;
  });
};
