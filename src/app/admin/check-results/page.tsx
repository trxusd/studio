
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ArrowLeft, Trophy } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, doc, writeBatch, Timestamp } from 'firebase/firestore';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    generated_at: Timestamp;
};

type ProcessedPrediction = MatchPrediction & {
    status: 'Win' | 'Loss' | 'Pending';
    finalScore: string;
    categoryId: string;
};

type GroupedResults = Record<string, ProcessedPrediction[]>;

const categoryTitles: Record<string, string> = {
    secure_trial: 'Secure Trial',
    free_coupon: 'Free Coupon',
    free_individual: 'Free Individual',
    exclusive_vip_1: 'Exclusive VIP Coupon 1',
    exclusive_vip_2: 'Exclusive VIP Coupon 2',
    exclusive_vip_3: 'Exclusive VIP Coupon 3',
    individual_vip: 'Individual VIP',
};


// This function checks a prediction against a final score.
function checkPredictionStatus(prediction: MatchPrediction, finalScore: string | null): 'Win' | 'Loss' | 'Pending' {
    if (!finalScore || ['NS', 'PST', 'CANC', 'TBD', 'ABD', '1H', '2H', 'HT'].includes(finalScore)) return 'Pending';
    
    const parts = finalScore.split('-').map(s => parseInt(s.trim(), 10));
    if (parts.some(isNaN) || parts.length < 2) return 'Pending';
    const [homeScore, awayScore] = parts;

    const predictionText = prediction.prediction.toLowerCase().replace(/\s+/g, '');

    // Double Chance (Must be checked before single bets)
    if (predictionText.includes('1x') || predictionText.includes('homewinordraw')) {
        return homeScore >= awayScore ? 'Win' : 'Loss';
    }
    if (predictionText.includes('x2') || predictionText.includes('awaywinordraw')) {
        return awayScore >= homeScore ? 'Win' : 'Loss';
    }
    if (predictionText.includes('12') || predictionText.includes('homeorawaywin')) {
        return homeScore !== awayScore ? 'Win' : 'Loss';
    }

    // 1X2 Predictions
    if (predictionText.includes('homewin') || predictionText === '1') {
        return homeScore > awayScore ? 'Win' : 'Loss';
    }
    if (predictionText.includes('awaywin') || predictionText === '2') {
        return awayScore > homeScore ? 'Win' : 'Loss';
    }
    if (predictionText.includes('draw') || predictionText === 'x') {
        return homeScore === awayScore ? 'Win' : 'Loss';
    }

    // Over/Under Predictions
    if (predictionText.startsWith('over')) {
        const value = parseFloat(predictionText.replace('over', ''));
        return (homeScore + awayScore) > value ? 'Win' : 'Loss';
    }
    if (predictionText.startsWith('under')) {
        const value = parseFloat(predictionText.replace('under', ''));
        return (homeScore + awayScore) < value ? 'Win' : 'Loss';
    }

    // Both Teams to Score (BTTS)
    if (predictionText.includes('btts') || predictionText.includes('gg')) {
        return homeScore > 0 && awayScore > 0 ? 'Win' : 'Loss';
    }
    
    // Correct Score (assuming format '1-0', '2-1', etc.)
    const scoreMatch = prediction.prediction.match(/^(\d+)-(\d+)$/);
    if (scoreMatch) {
        const predHome = parseInt(scoreMatch[1], 10);
        const predAway = parseInt(scoreMatch[2], 10);
        return homeScore === predHome && awayScore === predAway ? 'Win' : 'Loss';
    }

    return 'Pending'; // Default to Pending if no match
}


async function fetchMatchResult(fixtureId: number): Promise<string | null> {
    try {
        const response = await fetch(`/api/matches?id=${fixtureId}`);
        if (!response.ok) return 'Error';
        const data = await response.json();
        
        const match = data.matches?.[0];
        if (!match) return 'N/A';
        
        const finishedStatus = ['FT', 'AET', 'PEN'];
        if (finishedStatus.includes(match.fixture.status.short)) {
            const homeScore = match.goals.home ?? match.score.fulltime.home ?? 0;
            const awayScore = match.goals.away ?? match.score.fulltime.away ?? 0;
            return `${homeScore}-${awayScore}`;
        }

        // Return status text for matches not finished
        return match.fixture.status.short;

    } catch (e) {
        console.error(`Failed to fetch result for ${fixtureId}`, e);
        return 'Error';
    }
}

export default function CheckResultsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [groupedResults, setGroupedResults] = React.useState<GroupedResults>({});
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    const today = new Date().toISOString().split('T')[0];
    const categoriesQuery = firestore ? query(collection(firestore, `predictions/${today}/categories`), where("status", "==", "published")) : null;
    const { data: publishedCategories, loading: categoriesLoading } = useCollection<PredictionCategoryDoc>(categoriesQuery);

    const processAllPredictions = React.useCallback(async (categories: PredictionCategoryDoc[]) => {
        setIsLoading(true);
        if (!categories || categories.length === 0) {
            setGroupedResults({});
            setIsLoading(false);
            return;
        }
        
        const allPredictions = categories.flatMap(cat => cat.predictions.map(p => ({...p, categoryId: cat.id })));
        
        const processedResults = await Promise.all(
            allPredictions.map(async (p) => {
                const finalScore = await fetchMatchResult(p.fixture_id);
                const status = checkPredictionStatus(p, finalScore);
                return { ...p, finalScore: finalScore || 'N/A', status };
            })
        );
        
        const grouped = processedResults.reduce((acc, current) => {
            const category = current.categoryId;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(current);
            return acc;
        }, {} as GroupedResults);
        
        setGroupedResults(grouped);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        if (!categoriesLoading && publishedCategories) {
            processAllPredictions(publishedCategories);
        }
    }, [publishedCategories, categoriesLoading, processAllPredictions]);

    const handleSaveChanges = async () => {
        if (!firestore || Object.keys(groupedResults).length === 0) return;
        
        setIsSaving(true);
        const batch = writeBatch(firestore);
        let hasChanges = false;

        try {
            for (const categoryId in groupedResults) {
                const resultsForCategory = groupedResults[categoryId];
                const resolvedPredictions = resultsForCategory.filter(p => p.status !== 'Pending');

                if (resolvedPredictions.length === 0) continue;
                hasChanges = true;

                const categoryDocRef = doc(firestore, `predictions/${today}/categories/${categoryId}`);
                const categoryPredictions = publishedCategories?.find(c => c.id === categoryId)?.predictions || [];
                
                const updatedPredictionsMap = new Map(resolvedPredictions.map(p => [p.fixture_id, p]));

                const newPredictionsArray = categoryPredictions.map(p => {
                    if (updatedPredictionsMap.has(p.fixture_id)) {
                        const updatedPrediction = updatedPredictionsMap.get(p.fixture_id)!;
                        return { ...p, status: updatedPrediction.status, finalScore: updatedPrediction.finalScore };
                    }
                    return p;
                });
                
                batch.update(categoryDocRef, { predictions: newPredictionsArray });
            }

            if (!hasChanges) {
                toast({ title: "No changes to save", description: "All resolved predictions seem to be up to date."});
                setIsSaving(false);
                return;
            }

            await batch.commit();
            toast({
                title: "Results Saved!",
                description: "The results for all resolved matches have been saved to the database.",
            });

        } catch (error) {
            console.error("Error saving results:", error);
            toast({
                title: "Error",
                description: "Failed to save results.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const sortedCategories = Object.entries(groupedResults).sort(([a], [b]) => a.localeCompare(b));
    const allPredictions = Object.values(groupedResults).flat();
    const winCount = allPredictions.filter(r => r.status === 'Win').length;
    const resolvedCount = allPredictions.filter(r => r.status === 'Win' || r.status === 'Loss').length;
    const winRate = resolvedCount > 0 ? ((winCount / resolvedCount) * 100).toFixed(1) : 0;


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Check Match Results</CardTitle>
                <CardDescription>Automatically comparing final scores with predictions to determine Win/Loss status.</CardDescription>
            </div>
             <div className='flex gap-2'>
                <Button variant="outline" asChild>
                    <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => publishedCategories && processAllPredictions(publishedCategories)} disabled={isLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSaving || isLoading || resolvedCount === 0}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Results
                </Button>
            </div>
        </div>
         { !isLoading && resolvedCount > 0 && (
            <div className="pt-4">
                <p className="text-lg">Overall Win Rate: <span className="font-bold text-primary">{winRate}%</span> ({winCount}/{resolvedCount} won)</p>
            </div>
         )}
      </CardHeader>
      <CardContent>
        {isLoading || categoriesLoading ? (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Fetching live scores and checking results...</p>
            </div>
        ) : sortedCategories.length === 0 ? (
             <div className="text-center py-12 text-muted-foreground">
                <p>No published predictions found for today to check.</p>
            </div>
        ) : (
            <Accordion type="multiple" defaultValue={sortedCategories.map(([key]) => key)} className="w-full">
                {sortedCategories.map(([categoryId, results]) => {
                     const categoryWinCount = results.filter(r => r.status === 'Win').length;
                     const categoryResolvedCount = results.filter(r => r.status === 'Win' || r.status === 'Loss').length;
                     const categoryWinRate = categoryResolvedCount > 0 ? ((categoryWinCount / categoryResolvedCount) * 100).toFixed(1) : 0;

                    return (
                        <AccordionItem value={categoryId} key={categoryId}>
                            <AccordionTrigger className="font-semibold text-lg hover:no-underline">
                                <div className="flex items-center gap-4">
                                     <Trophy className="h-5 w-5 text-primary" />
                                    <span>{categoryTitles[categoryId] || categoryId}</span>
                                     {categoryResolvedCount > 0 && (
                                        <Badge variant="outline">
                                            {categoryWinRate}% ({categoryWinCount}/{categoryResolvedCount})
                                        </Badge>
                                     )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Match</TableHead>
                                            <TableHead>Prediction</TableHead>
                                            <TableHead>Final Score</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.map((result, index) => (
                                            <TableRow key={`${result.fixture_id}-${index}`}>
                                                <TableCell className="font-medium">{result.match}</TableCell>
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
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
