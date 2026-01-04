
import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export function ImageQualityTips() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenTips = sessionStorage.getItem("hasSeenImageQualityTips");
        if (!hasSeenTips) {
            // Small delay to ensure it doesn't clash with other initial renders or auth checks
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem("hasSeenImageQualityTips", "true");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <Lightbulb className="h-5 w-5" />
                        <span>Tips for Accurate Results</span>
                    </DialogTitle>
                    <DialogDescription>
                        Follow these guidelines to ensure the AI analyzes your sample correctly.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-3">
                        <div className="text-xl">📸</div>
                        <div className="text-sm">
                            <span className="font-semibold">Good Lighting:</span> Ensure the water sample is well-lit and clearly visible.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-xl">🧪</div>
                        <div className="text-sm">
                            <span className="font-semibold">Full Visibility:</span> Position the ammonia indicator strip fully within the frame.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-xl">🟦</div>
                        <div className="text-sm">
                            <span className="font-semibold">Clean Background:</span> Use a plain, non-reflective background to avoid distractions.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-xl">🔍</div>
                        <div className="text-sm">
                            <span className="font-semibold">Steady Hand:</span> Hold the camera steady and avoid blurry images.
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="text-xl">🌡️</div>
                        <div className="text-sm">
                            <span className="font-semibold">Distinguishable:</span> Ensure the water level and color change are clearly distinguishable.
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleDismiss} className="w-full sm:w-auto bg-gradient-ocean">
                        Got it, I'm ready!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
