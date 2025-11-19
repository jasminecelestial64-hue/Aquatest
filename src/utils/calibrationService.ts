export interface CalibrationSample {
  id: string;
  timestamp: number;
  knownConcentration: number;
  imageData: string;
  rawPrediction?: number;
  colorProfile?: {
    avgR: number;
    avgG: number;
    avgB: number;
  };
}

const CALIBRATION_STORAGE_KEY = "aquatest_calibration_data";

export const saveCalibrationSample = (sample: CalibrationSample) => {
  const samples = getCalibrationSamples();
  samples.push(sample);
  localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(samples));
};

export const getCalibrationSamples = (): CalibrationSample[] => {
  const data = localStorage.getItem(CALIBRATION_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearCalibration = () => {
  localStorage.removeItem(CALIBRATION_STORAGE_KEY);
};

export const deleteCalibrationSample = (id: string) => {
  const samples = getCalibrationSamples().filter(s => s.id !== id);
  localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(samples));
};

/**
 * Extracts color profile from image data
 */
export const extractColorProfile = async (imageData: string): Promise<{
  avgR: number;
  avgG: number;
  avgB: number;
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve({ avgR: 0, avgG: 0, avgB: 0 });
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      let sumR = 0, sumG = 0, sumB = 0;
      for (let i = 0; i < data.length; i += 4) {
        sumR += data[i];
        sumG += data[i + 1];
        sumB += data[i + 2];
      }

      const pixelCount = data.length / 4;
      resolve({
        avgR: sumR / pixelCount,
        avgG: sumG / pixelCount,
        avgB: sumB / pixelCount,
      });
    };
    img.src = imageData;
  });
};

/**
 * Applies calibration correction to prediction
 */
export const applyCalibration = (
  predictedConcentration: number,
  colorProfile: { avgR: number; avgG: number; avgB: number }
): number => {
  const samples = getCalibrationSamples();
  
  if (samples.length === 0) {
    return predictedConcentration;
  }

  // Find closest calibration sample by color similarity
  let closestSample: CalibrationSample | null = null;
  let minDistance = Infinity;

  samples.forEach(sample => {
    if (sample.colorProfile) {
      const distance = Math.sqrt(
        Math.pow(colorProfile.avgR - sample.colorProfile.avgR, 2) +
        Math.pow(colorProfile.avgG - sample.colorProfile.avgG, 2) +
        Math.pow(colorProfile.avgB - sample.colorProfile.avgB, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestSample = sample;
      }
    }
  });

  // Apply correction based on closest sample
  if (closestSample && closestSample.rawPrediction !== undefined) {
    const correctionFactor = closestSample.knownConcentration / closestSample.rawPrediction;
    return predictedConcentration * correctionFactor;
  }

  return predictedConcentration;
};
