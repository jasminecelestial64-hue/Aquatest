import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const ConfigError = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-destructive/50 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">Configuration Required</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-center text-muted-foreground">
                        The application cannot connect to Supabase because the environment variables are still set to their default placeholder values.
                    </p>
                    <div className="bg-secondary/50 p-4 rounded-md text-sm font-mono overflow-x-auto">
                        <p>VITE_SUPABASE_URL=your_project_url</p>
                        <p>VITE_SUPABASE_ANON_KEY=your_anon_key</p>
                    </div>
                    <p className="text-sm text-center">
                        Please open the <code className="bg-muted px-1 py-0.5 rounded">.env</code> file in your project root and replace these placeholders with your actual Supabase project credentials.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
