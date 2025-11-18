import { AmmoniaLevel } from "@/components/TestResult";

interface RoboflowConfig {
  apiKey: string;
  modelEndpoint: string;
  modelVersion?: string;
}

interface RoboflowPrediction {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image: {
    width: number;
    height: number;
  };
}

// This will be replaced with actual config from user
let roboflowConfig: RoboflowConfig | null = null;

export const setRoboflowConfig = (config: RoboflowConfig) => {
  roboflowConfig = config;
};

export const isConfigured = () => {
  return roboflowConfig !== null && roboflowConfig.apiKey !== "";
};

/**
 * Analyzes an image using the Roboflow model
 * @param imageData Base64 encoded image data
 * @returns Analysis results with ammonia level and concentration
 */
export const analyzeImage = async (imageData: string): Promise<{
  level: AmmoniaLevel;
  concentration: number;
  confidence: number;
  rawPredictions?: RoboflowPrediction[];
}> => {
  // If Roboflow is not configured, return mock data for testing
  if (!isConfigured()) {
    console.warn("Roboflow not configured, returning mock data");
    return generateMockResult();
  }

  try {
    // Remove data URL prefix if present
    const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");

    // Call Roboflow Hosted Inference API
    const response = await fetch(
      `${roboflowConfig!.modelEndpoint}?api_key=${roboflowConfig!.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: base64Image,
      }
    );

    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.statusText}`);
    }

    const data: RoboflowResponse = await response.json();

    // Process predictions and convert to ammonia concentration
    return processPredictions(data.predictions);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

/**
 * Processes Roboflow predictions and converts to ammonia metrics
 */
const processPredictions = (predictions: RoboflowPrediction[]) => {
  if (!predictions || predictions.length === 0) {
    return {
      level: "safe" as AmmoniaLevel,
      concentration: 0,
      confidence: 0,
    };
  }

  // Get the highest confidence prediction
  const topPrediction = predictions.reduce((prev, current) =>
    current.confidence > prev.confidence ? current : prev
  );

  // Map class names to concentration values
  // This mapping should be adjusted based on your actual model classes
  const classToConcentration: Record<string, number> = {
    "safe": 0.1,
    "low": 0.2,
    "elevated": 0.4,
    "medium": 0.6,
    "high": 0.8,
    "critical": 1.2,
    // Add more mappings based on your model's classes
  };

  const concentration = classToConcentration[topPrediction.class.toLowerCase()] || 0;
  const level = concentrationToLevel(concentration);

  return {
    level,
    concentration,
    confidence: Math.round(topPrediction.confidence * 100),
    rawPredictions: predictions,
  };
};

/**
 * Converts concentration value to ammonia level category
 */
const concentrationToLevel = (concentration: number): AmmoniaLevel => {
  if (concentration <= 0.25) return "safe";
  if (concentration <= 0.5) return "elevated";
  if (concentration <= 1.0) return "high";
  return "critical";
};

/**
 * Generates mock result for testing without Roboflow API
 */
const generateMockResult = () => {
  const mockConcentrations = [0.1, 0.15, 0.35, 0.65, 0.9, 1.3];
  const concentration = mockConcentrations[Math.floor(Math.random() * mockConcentrations.length)];
  
  return {
    level: concentrationToLevel(concentration),
    concentration,
    confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
  };
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
