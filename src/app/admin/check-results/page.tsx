
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { pastPredictions, type PastPrediction } from "@/lib/data";
import { Loader2 } from 'lucide-react';

type ProcessedPrediction = PastPrediction & {
    status: 'Win' | 'Loss';
};

// This function simulates the logic to check a prediction against a final score.
function checkPredictionStatus(prediction: PastPrediction): 'Win' | 'Loss' {
    const { finalScore, prediction: predictionText } = prediction;
    const [homeScore, awayScore] = finalScore.split('-').map(Number);

    // Simple logic for 1X2 predictions
    if (predictionText.includes('1') || predictionText.toLowerCase().includes(prediction.teamA.name)) {
        return homeScore > awayScore ? 'Win' : 'Loss';
    }
    if (predictionText.includes('2') || predictionText.toLowerCase().includes(prediction.teamB.name)) {
        return awayScore > homeScore ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('draw') || predictionText.includes('X')) {
        return homeScore === awayScore ? 'Win' : 'Loss';
    }

    // Simple logic for Over/Under
    if (predictionText.toLowerCase().includes('over')) {
        const value = parseFloat(predictionText.split(' ')[1]);
        return (homeScore + awayScore) > value ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('under')) {
        const value = parseFloat(predictionText.split(' ')[1]);
        return (homeScore + awayScore) < value ? 'Win' : 'Loss';
    }

    return 'Loss'; // Default to loss if format is unrecognized
}


export default function CheckResultsPage() {
    const [results, setResults] = React.useState<ProcessedPrediction[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        // Simulate fetching data and processing it
        const processResults = () => {
            const processed = pastPredictions.map(p => ({
                ...p,
                status: checkPredictionStatus(p)
            }));
            setResults(processed);
            setIsLoading(false);
        };

        const timer = setTimeout(processResults, 1500); // Simulate network delay
        return () => clearTimeout(timer);
    }, []);

    const winCount = results.filter(r => r.status === 'Win').length;
    const totalCount = results.length;
    const winRate = totalCount > 0 ? ((winCount / totalCount) * 100).toFixed(1) : 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Match Results</CardTitle>
        <CardDescription>Automatically comparing final scores with predictions to determine Win/Loss status.</CardDescription>
         { !isLoading && (
            <div className="pt-4">
                <p className="text-lg">Win Rate: <span className="font-bold text-primary">{winRate}%</span> ({winCount}/{totalCount} won)</p>
            </div>
         )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Checking results...</p>
            </div>
        ) : (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Match</TableHead>
                        <TableHead>League</TableHead>
                        <TableHead>Prediction</TableHead>
                        <TableHead>Final Score</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.map((result) => (
                        <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.teamA.name} vs {result.teamB.name}</TableCell>
                            <TableCell className="text-muted-foreground">{result.league}</TableCell>
                            <TableCell className="font-mono text-xs">{result.prediction}</TableCell>
                            <TableCell className="font-bold">{result.finalScore}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={result.status === 'Win' ? 'default' : 'destructive'} className={result.status === 'Win' ? 'bg-green-600' : ''}>
                                    {result.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
