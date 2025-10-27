
import {
  aiPoweredMatchPredictions,
  type AiPoweredMatchPredictionsOutput,
} from '@/ai/flows/ai-powered-match-predictions';
import { PredictionChart } from '@/components/prediction-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Team = {
  id: number;
  name: string;
  logo: string;
};

type League = {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
};

type Fixture = {
  id: number;
  referee: string | null;
  timezone: string;
  date: string;
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
  };
};

type ApiMatch = {
  fixture: Fixture;
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
};

async function getMatchDetails(matchId: string) {
  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const apiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    console.error("API key or host is not configured.");
    return null;
  }

  try {
    const response = await fetch(`https://${apiHost}/v3/fixtures?id=${matchId}`, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 60 } // Cache for 1 minute for live match details
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.response && data.response.length > 0) {
      return data.response[0] as ApiMatch;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch match details:", error);
    return null;
  }
}


export default async function MatchPredictionPage({ params }: { params: { matchId: string } }) {
  const match = await getMatchDetails(params.matchId);

  if (!match) {
    notFound();
  }

  let prediction: AiPoweredMatchPredictionsOutput;
  try {
      prediction = await aiPoweredMatchPredictions({
        teamA: match.teams.home.name,
        teamB: match.teams.away.name,
        matchDate: match.fixture.date,
      });
    } catch (e) {
      console.error("AI prediction failed", e);
      // Keep a default empty prediction on error
      prediction = {
        teamAWinProbability: 0,
        teamBWinProbability: 0,
        drawProbability: 0,
        keyStatistics: 'Prediction analysis is currently unavailable.',
        teamAAnalysis: 'Prediction analysis is currently unavailable.',
        teamBAnalysis: 'Prediction analysis is currently unavailable.',
      };
    }

  const predictionData = [
    { name: match.teams.home.name, value: Math.round(prediction.teamAWinProbability * 100), fill: 'hsl(var(--primary))' },
    { name: 'Draw', value: Math.round(prediction.drawProbability * 100), fill: 'hsl(var(--muted-foreground))' },
    { name: match.teams.away.name, value: Math.round(prediction.teamBWinProbability * 100), fill: 'hsl(var(--secondary-foreground))' },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/matches"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h2 className="font-headline text-3xl font-bold tracking-tight">
                Match Prediction
            </h2>
        </div>
        
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <Image src={match.teams.home.logo} alt={match.teams.home.name} width={80} height={80} className="rounded-full bg-white p-1" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg">{match.teams.home.name}</span>
                    </div>
                    <span className="font-headline text-4xl text-muted-foreground">VS</span>
                     <div className="flex flex-col items-center gap-2">
                        <Image src={match.teams.away.logo} alt={match.teams.away.name} width={80} height={80} className="rounded-full bg-white p-1" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg">{match.teams.away.name}</span>
                    </div>
                </div>
                <CardDescription className="mt-4">{match.league.name} - {new Date(match.fixture.date).toLocaleString()}</CardDescription>
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
                        <FileText className="text-primary"/>{match.teams.home.name} Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-card-foreground">
                    <p>{prediction.teamAAnalysis}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <FileText className="text-primary"/>{match.teams.away.name} Analysis
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
