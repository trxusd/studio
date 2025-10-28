
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
};

type ProcessedPrediction = MatchPrediction & {
    status: 'Win' | 'Loss' | 'Pending';
    finalScore: string;
};

// This function checks a prediction against a final score.
function checkPredictionStatus(prediction: MatchPrediction, finalScore: string | null): 'Win' | 'Loss' | 'Pending' {
    if (!finalScore) return 'Pending';
    
    const [homeScore, awayScore] = finalScore.split('-').map(Number);
    const predictionText = prediction.prediction;

    if (predictionText.toLowerCase().includes('home win') || predictionText.includes('1') ) {
        return homeScore > awayScore ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('away win') || predictionText.includes('2')) {
        return awayScore > homeScore ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('draw') || predictionText.includes('X')) {
        return homeScore === awayScore ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('over')) {
        const value = parseFloat(predictionText.split(' ')[1]);
        return (homeScore + awayScore) > value ? 'Win' : 'Loss';
    }
    if (predictionText.toLowerCase().includes('under')) {
        const value = parseFloat(predictionText.split(' ')[1]);
        return (homeScore + awayScore) < value ? 'Win' : 'Loss';
    }
     if (predictionText.toLowerCase().includes('btts') || predictionText.toLowerCase().includes('gg')) {
        return homeScore > 0 && awayScore > 0 ? 'Win' : 'Loss';
    }

    return 'Pending';
}

async function fetchMatchResult(fixtureId: number): Promise<string | null> {
    // This function now fetches from our internal API route
    try {
        const response = await fetch(`/api/matches?id=${fixtureId}`);
        if (!response.ok) return null;
        const data = await response.json();
        
        const match = data.matches?.[0];
        if (!match || match.fixture.status.short === 'NS') return null; // Not Started

        return `${match.goals.home}-${match.goals.away}`;

    } catch (e) {
        return null;
    }
}

export default function CheckResultsPage() {
    const firestore = useFirestore();
    const [results, setResults] = React.useState<ProcessedPrediction[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const today = new Date().toISOString().split('T')[0];
    const categoriesQuery = firestore ? query(collection(firestore, `predictions/${today}/categories`), where("status", "==", "published")) : null;
    const { data: publishedCategories, loading: categoriesLoading } = useCollection<PredictionCategoryDoc>(categoriesQuery);

    React.useEffect(() => {
        if (categoriesLoading || !publishedCategories) return;

        const processAllPredictions = async () => {
            setIsLoading(true);
            const allPredictions = publishedCategories.flatMap(cat => cat.predictions);
            
            const processedResults = await Promise.all(
                allPredictions.map(async (p) => {
                    const finalScore = await fetchMatchResult(p.fixture_id);
                    const status = checkPredictionStatus(p, finalScore);
                    return { ...p, finalScore: finalScore || 'N/A', status };
                })
            );
            
            setResults(processedResults);
            setIsLoading(false);
        };

        processAllPredictions();
    }, [publishedCategories, categoriesLoading]);

    const winCount = results.filter(r => r.status === 'Win').length;
    const resolvedCount = results.filter(r => r.status === 'Win' || r.status === 'Loss').length;
    const winRate = resolvedCount > 0 ? ((winCount / resolvedCount) * 100).toFixed(1) : 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Check Match Results</CardTitle>
        <CardDescription>Automatically comparing final scores with predictions to determine Win/Loss status.</CardDescription>
         { !isLoading && resolvedCount > 0 && (
            <div className="pt-4">
                <p className="text-lg">Win Rate: <span className="font-bold text-primary">{winRate}%</span> ({winCount}/{resolvedCount} won)</p>
            </div>
         )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Fetching live scores and checking results...</p>
            </div>
        ) : results.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                <p>No published predictions found for today to check.</p>
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
                        <TableRow key={result.fixture_id + result.prediction}>
                            <TableCell className="font-medium">{result.match}</TableCell>
                            <TableCell className="text-muted-foreground">{result.league}</TableCell>
                            <TableCell><Badge variant="secondary">{result.prediction}</Badge></TableCell>
                            <TableCell className="font-bold">{result.finalScore}</TableCell>
                            <TableCell className="text-right">
                                <Badge variant={result.status === 'Win' ? 'default' : result.status === 'Loss' ? 'destructive' : 'outline'} 
                                       className={result.status === 'Win' ? 'bg-green-600' : ''}>
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
