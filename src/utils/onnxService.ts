
import * as ort from 'onnxruntime-web';
import { extractColorProfile, applyCalibration } from "./calibrationService";
import { AmmoniaLevel } from "@/components/TestResult";

// Configure ONNX Runtime to use WASM
ort.env.wasm.wasmPaths = "/"; // Expects .wasm files in public root

export interface DetectionResult {
    box: [number, number, number, number]; // [x, y, w, h]
    score: number;
    classId: number;
    label: string;
}

export interface InferenceResult {
    level: AmmoniaLevel;
    concentration: number;
    confidence: number;
    detections: DetectionResult[];
}

const MODEL_PATH = '/models/best.onnx';
const INPUT_SIZE = 640;
const CONFIDENCE_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;

// Class names mapping (based on previous Roboflow config)
const CLASS_NAMES: Record<number, string> = {
    0: "safe",
    1: "low",
    2: "elevated",
    3: "medium",
    4: "high",
    5: "critical"
};

// Concentration mapping for classes
const CLASS_CONCENTRATION: Record<string, number> = {
    "safe": 0.1,
    "low": 0.2,
    "elevated": 0.4,
    "medium": 0.6,
    "high": 0.8,
    "critical": 1.2
};

let session: ort.InferenceSession | null = null;

/**
 * Initialize the ONNX session
 */
export const initModel = async () => {
    if (session) return;
    try {
        console.log("Loading model from:", MODEL_PATH);
        session = await ort.InferenceSession.create(MODEL_PATH, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all'
        });
        console.log("ONNX Model loaded successfully");
        console.log("Model Inputs:", session.inputNames);
        console.log("Model Outputs:", session.outputNames);
    } catch (e) {
        console.error("Failed to load ONNX model:", e);
        throw e;
    }
};

/**
 * Process image and run inference
 */
export const runInference = async (imageData: string): Promise<InferenceResult> => {
    if (!session) await initModel();

    // 1. Preprocess
    const { tensor, originalSize } = await preprocessImage(imageData);

    // 2. Run Inference
    const feeds = { images: tensor };
    const results = await session!.run(feeds);
    const output = results[session!.outputNames[0]]; // usually "output0"

    // 3. Postprocess
    const detections = postprocess(output.data as Float32Array, originalSize);

    // 4. Calculate Ammonia Metrics
    return calculateResult(detections, imageData);
};

const preprocessImage = async (base64Image: string): Promise<{ tensor: ort.Tensor; originalSize: [number, number] }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = INPUT_SIZE;
            canvas.height = INPUT_SIZE;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("No context");

            // Draw and resize
            ctx.drawImage(img, 0, 0, INPUT_SIZE, INPUT_SIZE);
            const imageData = ctx.getImageData(0, 0, INPUT_SIZE, INPUT_SIZE);
            const { data } = imageData;

            // Normalize to [0, 1] and transpose to CHW
            const float32Data = new Float32Array(3 * INPUT_SIZE * INPUT_SIZE);
            for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
                const r = data[i * 4] / 255.0;
                const g = data[i * 4 + 1] / 255.0;
                const b = data[i * 4 + 2] / 255.0;

                // CHW Layout: RRR...GGG...BBB...
                float32Data[i] = r;
                float32Data[INPUT_SIZE * INPUT_SIZE + i] = g;
                float32Data[2 * INPUT_SIZE * INPUT_SIZE + i] = b;
            }

            const tensor = new ort.Tensor('float32', float32Data, [1, 3, INPUT_SIZE, INPUT_SIZE]);
            resolve({ tensor, originalSize: [img.width, img.height] });
        };
        img.onerror = reject;
        img.src = base64Image;
    });
};

const postprocess = (data: Float32Array, originalSize: [number, number]): DetectionResult[] => {
    const [origW, origH] = originalSize;
    const numClasses = Object.keys(CLASS_NAMES).length;
    const numAnchors = 8400; // standard for YOLOv8 640x640

    // Output shape is usually [1, 4 + numClasses, 8400]
    // We need to transpose logic: iterate over 8400 anchors

    const boxes: DetectionResult[] = [];

    for (let i = 0; i < numAnchors; i++) {
        // Find max score among classes
        let maxScore = 0;
        let maxClass = -1;

        // The data is commonly flattened: [xc, yc, w, h, class0, class1...] per anchor?
        // WARNING: YOLOv8 output is [1, 4 + numClasses, 8400]. 
        // Strides = 8400 (if channel-last?) Or [batch, channel, anchor]
        // Usually it is [1, 84, 8400] for 80 classes. Here 4 + 6 = 10 channels.
        // data[channel * 8400 + anchor_idx]

        // Check channels 4 to 9 (indices) for classes
        for (let c = 0; c < numClasses; c++) {
            const score = data[(4 + c) * numAnchors + i];
            if (score > maxScore) {
                maxScore = score;
                maxClass = c;
            }
        }

        if (maxScore > CONFIDENCE_THRESHOLD) {
            const xc = data[0 * numAnchors + i];
            const yc = data[1 * numAnchors + i];
            const w = data[2 * numAnchors + i];
            const h = data[3 * numAnchors + i];

            // Convert Center-based to Top-Left based relative to 640x640
            // x = xc - w/2, y = yc - h/2
            const x = (xc - w / 2) / INPUT_SIZE * origW;
            const y = (yc - h / 2) / INPUT_SIZE * origH;
            const width = (w / INPUT_SIZE) * origW;
            const height = (h / INPUT_SIZE) * origH;

            boxes.push({
                box: [x, y, width, height],
                score: maxScore,
                classId: maxClass,
                label: CLASS_NAMES[maxClass] || "unknown"
            });
        }
    }

    return nms(boxes);
};

const nms = (boxes: DetectionResult[]): DetectionResult[] => {
    boxes.sort((a, b) => b.score - a.score);
    const selected: DetectionResult[] = [];
    const active = new Array(boxes.length).fill(true);

    for (let i = 0; i < boxes.length; i++) {
        if (!active[i]) continue;
        selected.push(boxes[i]);

        for (let j = i + 1; j < boxes.length; j++) {
            if (active[j] && iou(boxes[i].box, boxes[j].box) > IOU_THRESHOLD) {
                active[j] = false;
            }
        }
    }
    return selected;
};

const iou = (boxA: [number, number, number, number], boxB: [number, number, number, number]) => {
    const [xA, yA, wA, hA] = boxA;
    const [xB, yB, wB, hB] = boxB;

    const xA2 = xA + wA;
    const yA2 = yA + hA;
    const xB2 = xB + wB;
    const yB2 = yB + hB;

    const xI1 = Math.max(xA, xB);
    const yI1 = Math.max(yA, yB);
    const xI2 = Math.min(xA2, xB2);
    const yI2 = Math.min(yA2, yB2);

    const interW = Math.max(0, xI2 - xI1);
    const interH = Math.max(0, yI2 - yI1);
    const intersection = interW * interH;

    const areaA = wA * hA;
    const areaB = wB * hB;

    return intersection / (areaA + areaB - intersection);
};

const calculateResult = async (detections: DetectionResult[], imageData: string): Promise<InferenceResult> => {
    if (detections.length === 0) {
        throw new Error('Invalid image: Please upload a clear photo of a water sample with ammonia detection visible.');
    }

    // Pick best detection
    const best = detections[0];
    const rawConcentration = CLASS_CONCENTRATION[best.label] || 0;

    // Apply Color Calibration
    const colorProfile = await extractColorProfile(imageData);
    const calibratedConcentration = applyCalibration(rawConcentration, colorProfile);

    return {
        level: concentrationToLevel(calibratedConcentration),
        concentration: calibratedConcentration,
        confidence: Math.round(best.score * 100),
        detections
    };
};

const concentrationToLevel = (concentration: number): AmmoniaLevel => {
    if (concentration <= 0.25) return "safe";
    if (concentration <= 0.5) return "elevated";
    if (concentration <= 1.0) return "high";
    return "critical";
};

/**
 * Draw detections on the canvas
 */
export const drawDetections = (canvas: HTMLCanvasElement, detections: DetectionResult[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw detections on the existing canvas content
    // Do not clear the canvas here, as the caller usually draws the image first

    detections.forEach(det => {
        const [x, y, w, h] = det.box;
        const color = getColorForLabel(det.label);

        // Draw Box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Draw Label Background
        ctx.fillStyle = color;
        const text = `${det.label} ${(det.score * 100).toFixed(0)}%`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x, y - 25, textWidth + 10, 25);

        // Draw Label Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px sans-serif';
        ctx.fillText(text, x + 5, y - 7);
    });
};

const getColorForLabel = (label: string): string => {
    switch (label) {
        case 'safe': return '#10B981'; // green-500
        case 'low': return '#34D399'; // green-400
        case 'elevated': return '#F59E0B'; // amber-500
        case 'high': return '#EF4444'; // red-500
        case 'critical': return '#7F1D1D'; // red-900
        default: return '#3B82F6'; // blue-500
    }
};
