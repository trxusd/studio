import {
  aiPoweredMatchPredictions,
  type AiPoweredMatchPredictionsOutput,
} from '@/ai/flows/ai-powered-match-predictions';
import { PredictionChart } from '@/components/prediction-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { matches } from '@/lib/data';
import { ArrowLeft, BarChart, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function MatchPredictionPage({ params }: { params: { matchId: string } }) {
  const match = matches.find((m) => m.id === params.matchId);

  if (!match) {
    notFound();
  }

  // In a real application, you might fetch fresh predictions if they are old.
  // For this prototype, we'll use the mock data or generate if not present.
  let prediction: AiPoweredMatchPredictionsOutput = match.prediction || {
      teamAWinProbability: 0,
      teamBWinProbability: 0,
      drawProbability: 0,
      keyStatistics: 'N/A',
      teamAAnalysis: 'N/A',
      teamBAnalysis: 'N/A',
    };

  // For demonstration, let's call the AI if there's no mock prediction.
  // This would be cached in a real app.
  if (!match.prediction) {
    try {
      prediction = await aiPoweredMatchPredictions({
        teamA: match.teamA.name,
        teamB: match.teamB.name,
        matchDate: match.date.toISOString(),
      });
    } catch (e) {
      console.error("AI prediction failed", e);
      // Keep the default empty prediction on error
    }
  }

  const predictionData = [
    { name: match.teamA.name, value: Math.round(prediction.teamAWinProbability * 100), fill: 'hsl(var(--primary))' },
    { name: 'Draw', value: Math.round(prediction.drawProbability * 100), fill: 'hsl(var(--muted-foreground))' },
    { name: match.teamB.name, value: Math.round(prediction.teamBWinProbability * 100), fill: 'hsl(var(--secondary-foreground))' },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/predictions"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h2 className="font-headline text-3xl font-bold tracking-tight">
                Match Prediction
            </h2>
        </div>
        
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <Image src={match.teamA.logo} alt={match.teamA.name} width={80} height={80} className="rounded-full" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg">{match.teamA.name}</span>
                    </div>
                    <span className="font-headline text-4xl text-muted-foreground">VS</span>
                     <div className="flex flex-col items-center gap-2">
                        <Image src={match.teamB.logo} alt={match.teamB.name} width={80} height={80} className="rounded-full" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg">{match.teamB.name}</span>
                    </div>
                </div>
                <CardDescription className="mt-4">{match.league} - {new Date(match.date).toLocaleString()}</CardDescription>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BarChart className="text-primary"/>Win Probability</CardTitle>
                    <CardDescription>AI-generated prediction based on historical data and team form.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PredictionChart data={predictionData} />
                </CardContent>
            </Card>

             <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Star className="text-primary"/>Key Statistics</CardTitle>
                     <CardDescription>Critical data points influencing the match outcome.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="prose prose-sm max-w-none text-card-foreground">
                    <p>{prediction.keyStatistics}</p>
                   </div>
                </CardContent>
            </Card>
        </div>

         <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <FileText className="text-primary"/>{match.teamA.name} Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-card-foreground">
                    <p>{prediction.teamAAnalysis}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <FileText className="text-primary"/>{match.teamB.name} Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-card-foreground">
                    <p>{prediction.teamBAnalysis}</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
