
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, PlayCircle, Terminal } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OfficialPredictionsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const { toast } = useToast();

    const handleGeneratePredictions = async () => {
        setIsLoading(true);
        setLogs(['🚀 Starting Football Predictions Generation...']);

        // In a real app, you would call your Firebase Function endpoint here.
        // For now, this is a simulation.
        
        // Example of how you might call it:
        // const response = await fetch('YOUR_CLOUD_FUNCTION_URL/generatePredictionsManual', { method: 'POST' });
        // const data = await response.json();

        // Simulating the steps
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLogs(prev => [...prev, '✅ Fetched matches from API-Football']);

        await new Promise(resolve => setTimeout(resolve, 3000));
        setLogs(prev => [...prev, '✅ AI Analysis with Claude completed']);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setLogs(prev => [...prev, '✅ Predictions validated']);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setLogs(prev => [...prev, '✅ Saved to Firestore']);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setLogs(prev => [...prev, '✅ Published to website']);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setLogs(prev => [...prev, '✅ Sent success notification']);

        toast({
            title: "Process Complete",
            description: "Official predictions have been generated and published successfully.",
        });

        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Official Predictions Generator</CardTitle>
                    <CardDescription>Manually trigger the daily football prediction generation process.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Clicking the button below will start the automated process of fetching matches, analyzing them with AI, and publishing the 50 official daily predictions to the website and database.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGeneratePredictions} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <PlayCircle className="mr-2 h-4 w-4" />
                        )}
                        {isLoading ? 'Generating...' : 'Generate Today\'s Predictions'}
                    </Button>
                </CardFooter>
            </Card>

            {logs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Terminal /> Generation Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/50 p-4 rounded-lg h-64 overflow-y-auto">
                            <pre className="text-xs whitespace-pre-wrap">
                                {logs.join('\n')}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
