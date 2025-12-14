import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { userAgentRegex } from "../userAgentRegex";

export const BrowserSupport = () => {
    const [isSupported, setIsSupported] = useState(true);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        // The regex matches *supported* browsers.
        // If it matches, the browser is supported.
        const matches = userAgentRegex.test(userAgent);
        setIsSupported(matches);

        if (!matches) {
            setIsVisible(true);
        }
    }, []);

    if (isSupported || !isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <Alert variant="destructive" className="shadow-lg border-destructive/50 bg-destructive/10 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                    Unsupported Browser
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2 -mt-1 hover:bg-destructive/20 text-destructive"
                        onClick={() => setIsVisible(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </AlertTitle>
                <AlertDescription className="mt-2">
                    Your browser may not support all features of this application.
                    For the best experience, please upgrade to a modern browser.
                </AlertDescription>
            </Alert>
        </div>
    );
};
