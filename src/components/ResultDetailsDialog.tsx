
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";
import { InferenceResult } from "@/utils/onnxService";

interface ResultDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    result: InferenceResult | { error: string } | null;
    imageUrl: string;
}

export function ResultDetailsDialog({ isOpen, onClose, result, imageUrl }: ResultDetailsDialogProps) {
    if (!result) return null;

    const isError = 'error' in result;
    const isAccepted = !isError && result.level !== undefined; // Valid inference result

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isAccepted ? (
                            <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>Analysis Accepted</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span>Analysis Rejected</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Detailed breakdown of the AI model's assessment.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[80vh] w-full pr-4">
                    <div className="space-y-6">
                        {/* Image Preview */}
                        <div className="relative rounded-lg overflow-hidden border border-border bg-black/5 aspect-square max-h-64 mx-auto">
                            <img
                                src={imageUrl}
                                alt="Analyzed Sample"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        {/* Status & Reason */}
                        <div className="space-y-3">
                            {isError ? (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-destructive">Rejection Reason</h4>
                                            <p className="text-sm text-foreground/80 mt-1">
                                                {result.error}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg border border-border">
                                        <span className="text-sm font-medium">Ammonia Level</span>
                                        <Badge variant={
                                            result.level === 'safe' ? 'default' :
                                                result.level === 'elevated' ? 'secondary' :
                                                    'destructive'
                                        } className="capitalize">
                                            {result.level} ({result.concentration.toFixed(2)} ppm)
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-secondary/20 p-3 rounded-lg border border-border">
                                            <label className="text-xs text-muted-foreground block mb-1">Confidence</label>
                                            <span className="font-mono font-medium text-lg">
                                                {result.confidence}%
                                            </span>
                                        </div>
                                        <div className="bg-secondary/20 p-3 rounded-lg border border-border">
                                            <label className="text-xs text-muted-foreground block mb-1">Detections</label>
                                            <span className="font-mono font-medium text-lg">
                                                {result.detections.length}
                                            </span>
                                        </div>
                                    </div>

                                    {result.detections.length > 0 && (
                                        <div className="border border-border rounded-lg p-3">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                                Primary Detection
                                            </h4>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                <p>Label: <span className="text-foreground">{result.detections[0].label}</span></p>
                                                <p>Score: <span className="text-foreground">{(result.detections[0].score * 100).toFixed(1)}%</span></p>
                                                <p>Box: <span className="font-mono">
                                                    [{result.detections[0].box.map(n => Math.round(n)).join(', ')}]
                                                </span></p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
