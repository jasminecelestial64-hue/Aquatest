import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ImageUploadProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
}

export const ImageUpload = ({ onCapture, onClose }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setPreview(result);
            setError("");
        };
        reader.onerror = () => {
            setError("Failed to read file.");
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = () => {
        if (preview) {
            onCapture(preview);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-card shadow-lg border-border flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Upload Test Strip</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center min-h-[300px]">
                    {error ? (
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                            <p className="text-destructive font-medium">{error}</p>
                            <Button variant="outline" onClick={() => setError("")}>Try Again</Button>
                        </div>
                    ) : preview ? (
                        <div className="space-y-4 w-full">
                            <div className="relative rounded-lg overflow-hidden border border-border aspect-[3/4] bg-black/5">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setPreview(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                            >
                                Choose Different Image
                            </Button>
                        </div>
                    ) : (
                        <div
                            className="w-full h-64 border-2 border-dashed border-muted-foreground/25 rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium text-foreground">Click to upload</p>
                                <p className="text-sm text-muted-foreground">or drag and drop image here</p>
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-gradient-ocean border-0"
                        disabled={!preview}
                        onClick={handleUpload}
                    >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Analyze Image
                    </Button>
                </div>
            </Card>
        </div>
    );
};
