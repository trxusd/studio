
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, PlayCircle, Terminal, FileJson, UploadCloud, ArrowLeft, Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateFBWSpecialPredictions } from "@/ai/flows/fbw-special-predictions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useDoc } from "@/firebase";
import { doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

type MatchPrediction = {
    fixture_id: number;
    match: string;
    league: string;
    prediction: string;
    odds: number;
    confidence: number;
};

type PredictionDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
};

const PredictionTable = ({ matches }: { matches: MatchPrediction[] }) => {
    if (!matches || matches.length === 0) {
        return <p className="text-sm text-center text-muted-foreground py-8">No special predictions generated for this session.</p>;
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead className="text-right">Odds</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {matches.map((p, index) => (
                    <TableRow key={p.fixture_id || index}>
                        <TableCell className="font-medium">{p.match}</TableCell>
                        <TableCell>{p.league}</TableCell>
                        <TableCell><Badge variant="secondary">{p.prediction}</Badge></TableCell>
                        <TableCell className="text-right font-bold text-primary">{p.odds.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-bold">{p.confidence}%</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default function FBWSpecialPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [isPublishing, setPublishing] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();
    const today = new Date().toISOString().split('T')[0];

    const predictionDocRef = firestore ? doc(firestore, `predictions/${today}/categories/fbw_special`) : null;
    const { data: predictionDoc, loading: docLoading } = useDoc<PredictionDoc>(predictionDocRef);

    const handleGeneratePredictions = async () => {
        setIsGenerating(true);
        setLogs(['🚀 Starting FBW SPECIAL Predictions Generation...']);

        try {
            setLogs(prev => [...prev, '⏳ Fetching matches & running elite AI analysis... This may take a moment.']);
            const result = await generateFBWSpecialPredictions();
            
            setLogs(prev => [...prev, `✅ AI Analysis complete. Found ${result.special_picks.length} special picks.`]);
            setLogs(prev => [...prev, '✅ Predictions saved to Firestore with "unpublished" status.']);
            setLogs(prev => [...prev, '🎉 Process Finished! You can now publish the list.']);

            toast({
                title: "Process Complete",
                description: `FBW Special predictions generated successfully (${result.special_picks.length} picks).`,
            });

        } catch (error: any) {
            const errorMessage = error.message || "An unknown error occurred.";
            setLogs(prev => [...prev, `❌ Error: ${errorMessage}`]);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: errorMessage,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublishToggle = async () => {
        if (!firestore || !predictionDoc) return;
        
        const newStatus = predictionDoc.status === 'published' ? 'unpublished' : 'published';
        setPublishing(true);

        try {
            await updateDoc(predictionDocRef!, { status: newStatus });
            toast({
                title: 'Status Updated',
                description: `FBW Special list has been ${newStatus}.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update publication status.',
                variant: 'destructive',
            });
        } finally {
            setPublishing(false);
        }
    };
    
    const predictions = predictionDoc?.predictions || [];
    const status = predictionDoc?.status || 'unpublished';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-3"><Star className="text-primary"/>FBW Special Agent</CardTitle>
                         <Button variant="outline" asChild>
                            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                        </Button>
                    </div>
                    <CardDescription>Manually trigger the elite prediction generation process for the "FBW Special" category.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        This agent uses very strict rules to find a small, highly confident list of predictions.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleGeneratePredictions} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Generating...' : 'Generate Today\'s Special Picks'}
                    </Button>
                </CardFooter>
            </Card>

            {logs.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Terminal /> Generation Logs</CardTitle></CardHeader>
                    <CardContent className="bg-muted/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{logs.join('\n')}</pre>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2"><FileJson /> Generated FBW Special List</CardTitle>
                            <CardDescription>
                                The list of elite predictions generated by the agent for today.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                             <Badge variant={status === 'published' ? 'default' : 'secondary'} className={status === 'published' ? 'bg-green-600' : ''}>
                                {status}
                            </Badge>
                             <Button onClick={handlePublishToggle} disabled={isPublishing || docLoading || !predictionDoc}>
                                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {status === 'published' ? 'Unpublish' : 'Publish All'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {docLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <PredictionTable matches={predictions} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
