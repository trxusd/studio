
import {
  aiPoweredMatchPredictions,
  type AiPoweredMatchPredictionsOutput,
} from '@/ai/flows/ai-powered-match-predictions';
import { PredictionChart } from '@/components/prediction-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart, FileText, Star, Users, List, Shield, Shirt, GanttChartSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Types from API
type Team = { id: number; name: string; logo: string; };
type League = { id: number; name: string; country: string; logo: string; flag: string | null; season: number; };
type Fixture = { id: number; referee: string | null; timezone: string; date: string; timestamp: number; periods: { first: number | null; second: number | null; }; venue: { id: number | null; name: string | null; city: string | null; }; status: { long: string; short: string; elapsed: number | null; }; };
type ApiMatch = { fixture: Fixture; league: League; teams: { home: Team; away: Team; }; goals: { home: number | null; away: number | null; }; score: { halftime: { home: number | null; away: number | null; }; fulltime: { home: number | null; away: number | null; }; extratime: { home: number | null; away: number | null; }; penalty: { home: number | null; away: number | null; }; }; };
type LineupPlayer = { player: { id: number; name: string; number: number; pos: string; grid: string | null; } };
type ApiLineup = { team: Team; formation: string; startXI: LineupPlayer[]; substitutes: LineupPlayer[]; coach: { id: number; name: string; photo: string; } };
type OddValue = { value: string; odd: string; };
type Bookmaker = { id: number; name: string; bets: { id: number; name: string; values: OddValue[] }[] };
type ApiOdds = { fixture: Fixture; league: League; update: string; bookmakers: Bookmaker[] };
type Standing = { rank: number; team: Team; points: number; goalsDiff: number; group: string; form: string; status: string; description: string | null; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number; } } };
type ApiStandings = { league: { id: number; name: string; country: string; logo: string; flag: string; season: number; standings: Standing[][] } };


const API_HOST = "api-football.p.rapidapi.com";
const API_KEY = process.env.FOOTBALL_API_KEY;

async function fetchFromApi(endpoint: string) {
    if (!API_KEY || !API_HOST) {
        console.error("API key or host is not configured.");
        return null;
    }
    try {
        const response = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
            headers: { 'x-rapidapi-host': API_HOST, 'x-rapidapi-key': API_KEY, },
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!response.ok) {
            console.error(`API request failed for ${endpoint} with status: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(`Failed to fetch from ${endpoint}:`, error);
        return null;
    }
}

async function getMatchDetails(matchId: string): Promise<ApiMatch | null> {
    const response = await fetchFromApi(`fixtures?id=${matchId}`);
    return response && response.length > 0 ? response[0] : null;
}

async function getLineups(matchId: string): Promise<ApiLineup[] | null> {
    return await fetchFromApi(`fixtures/lineups?fixture=${matchId}`);
}

async function getOdds(matchId: string): Promise<ApiOdds[] | null> {
    return await fetchFromApi(`odds?fixture=${matchId}`);
}

async function getStandings(leagueId: number, season: number): Promise<ApiStandings | null> {
    const response = await fetchFromApi(`standings?league=${leagueId}&season=${season}`);
    return response && response.length > 0 ? response[0] : null;
}


export default async function MatchPredictionPage({ params }: { params: { matchId: string } }) {
  const match = await getMatchDetails(params.matchId);
  
  if (!match) {
    notFound();
  }

  const [lineups, odds, standings, prediction] = await Promise.all([
      getLineups(params.matchId),
      getOdds(params.matchId),
      getStandings(match.league.id, match.league.season),
      aiPoweredMatchPredictions({
        teamA: match.teams.home.name,
        teamB: match.teams.away.name,
        matchDate: match.fixture.date,
      }).catch(e => {
        console.error("AI prediction failed", e);
        return {
            teamAWinProbability: 0, teamBWinProbability: 0, drawProbability: 0,
            keyStatistics: 'Prediction analysis is currently unavailable.',
            teamAAnalysis: 'Prediction analysis is currently unavailable.',
            teamBAnalysis: 'Prediction analysis is currently unavailable.'
        };
      })
  ]);

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
                Détails du Match
            </h2>
        </div>
        
        <Card>
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-8">
                    <div className="flex flex-col items-center gap-2 w-40">
                        <Image src={match.teams.home.logo} alt={match.teams.home.name} width={80} height={80} className="rounded-full bg-white p-1" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg text-center">{match.teams.home.name}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-headline text-5xl">
                           {match.fixture.status.short === 'NS' ? 'VS' : `${match.goals.home} - ${match.goals.away}`}
                        </span>
                        {match.fixture.status.elapsed && <Badge variant="destructive" className="mt-2 animate-pulse">{match.fixture.status.elapsed}'</Badge>}
                    </div>
                     <div className="flex flex-col items-center gap-2 w-40">
                        <Image src={match.teams.away.logo} alt={match.teams.away.name} width={80} height={80} className="rounded-full bg-white p-1" data-ai-hint="sports logo" />
                        <span className="font-bold text-lg text-center">{match.teams.away.name}</span>
                    </div>
                </div>
                <CardDescription className="mt-4">{match.league.name} - {new Date(match.fixture.date).toLocaleString()}</CardDescription>
            </CardHeader>
        </Card>

        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="composition">Composition</TabsTrigger>
                <TabsTrigger value="odds">Odds</TabsTrigger>
                <TabsTrigger value="standings">Classement</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
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
                           <div className="prose prose-sm max-w-none text-card-foreground dark:prose-invert">
                            <p>{prediction.keyStatistics}</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                 <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="text-primary"/>{match.teams.home.name} Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-card-foreground dark:prose-invert">
                            <p>{prediction.teamAAnalysis}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <FileText className="text-primary"/>{match.teams.away.name} Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-sm max-w-none text-card-foreground dark:prose-invert">
                            <p>{prediction.teamBAnalysis}</p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="composition" className="mt-4">
                 <TeamLineup lineups={lineups} />
            </TabsContent>
            <TabsContent value="odds" className="mt-4">
                <MatchOdds odds={odds} />
            </TabsContent>
            <TabsContent value="standings" className="mt-4">
                 <LeagueStandings standings={standings} />
            </TabsContent>
        </Tabs>

    </div>
  );
}

function TeamLineup({ lineups }: { lineups: ApiLineup[] | null }) {
    if (!lineups || lineups.length < 2) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="text-primary"/>Composition des Équipes</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">La composition des équipes n'est pas encore disponible.</p>
                </CardContent>
            </Card>
        );
    }

    const homeTeam = lineups[0];
    const awayTeam = lineups[1];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Users className="text-primary"/>Composition des Équipes</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Image src={homeTeam.team.logo} alt={homeTeam.team.name} width={24} height={24} data-ai-hint="sports logo"/>
                        {homeTeam.team.name} ({homeTeam.formation})
                    </h3>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Onze de départ</h4>
                        {homeTeam.startXI.map(p => <div key={p.player.id} className="flex items-center gap-2 text-sm"><Badge variant="outline" className="w-8 justify-center">{p.player.number}</Badge> <span>{p.player.name} ({p.player.pos})</span></div>)}
                        <h4 className="font-semibold text-sm pt-2">Remplaçants</h4>
                        {homeTeam.substitutes.map(p => <div key={p.player.id} className="flex items-center gap-2 text-sm"><Badge variant="outline" className="w-8 justify-center">{p.player.number}</Badge> <span>{p.player.name} ({p.player.pos})</span></div>)}
                        <h4 className="font-semibold text-sm pt-2">Entraîneur</h4>
                        <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6"><AvatarImage src={homeTeam.coach.photo} alt={homeTeam.coach.name} /><AvatarFallback>{homeTeam.coach.name.charAt(0)}</AvatarFallback></Avatar>
                             <span>{homeTeam.coach.name}</span>
                        </div>
                    </div>
                </div>
                 <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                         <Image src={awayTeam.team.logo} alt={awayTeam.team.name} width={24} height={24} data-ai-hint="sports logo"/>
                        {awayTeam.team.name} ({awayTeam.formation})
                    </h3>
                     <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Onze de départ</h4>
                        {awayTeam.startXI.map(p => <div key={p.player.id} className="flex items-center gap-2 text-sm"><Badge variant="outline" className="w-8 justify-center">{p.player.number}</Badge> <span>{p.player.name} ({p.player.pos})</span></div>)}
                        <h4 className="font-semibold text-sm pt-2">Remplaçants</h4>
                        {awayTeam.substitutes.map(p => <div key={p.player.id} className="flex items-center gap-2 text-sm"><Badge variant="outline" className="w-8 justify-center">{p.player.number}</Badge> <span>{p.player.name} ({p.player.pos})</span></div>)}
                        <h4 className="font-semibold text-sm pt-2">Entraîneur</h4>
                        <div className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6"><AvatarImage src={awayTeam.coach.photo} alt={awayTeam.coach.name} /><AvatarFallback>{awayTeam.coach.name.charAt(0)}</AvatarFallback></Avatar>
                             <span>{awayTeam.coach.name}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MatchOdds({ odds }: { odds: ApiOdds[] | null }) {
    if (!odds || odds.length === 0 || !odds[0].bookmakers || odds[0].bookmakers.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Shield className="text-primary"/>Odds</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Les odds pour ce match ne sont pas encore disponibles.</p>
                </CardContent>
            </Card>
        );
    }
    
    // We'll display odds from the first available bookmaker, for the "Match Winner" bet.
    const bookmaker = odds[0].bookmakers[0];
    const matchWinnerBet = bookmaker?.bets.find(bet => bet.name === "Match Winner");

    if (!matchWinnerBet) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Shield className="text-primary"/>Odds</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Les odds "Match Winner" ne sont pas disponibles pour ce match.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Shield className="text-primary"/>Odds - {bookmaker.name}</CardTitle>
                <CardDescription>Les odds peuvent changer. Dernière mise à jour: {new Date(odds[0].update).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pari</TableHead>
                            <TableHead className="text-right">Odd</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {matchWinnerBet.values.map(val => (
                            <TableRow key={val.value}>
                                <TableCell className="font-medium">{val.value}</TableCell>
                                <TableCell className="text-right font-bold">{val.odd}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

function LeagueStandings({ standings }: { standings: ApiStandings | null }) {
    if (!standings || !standings.league.standings || standings.league.standings.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><GanttChartSquare className="text-primary"/>Classement</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Le classement pour cette ligue n'est pas encore disponible.</p>
                </CardContent>
            </Card>
        );
    }
    
    const allStandings = standings.league.standings[0]; // Assuming it's not a grouped league with multiple standings tables

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><GanttChartSquare className="text-primary"/>{standings.league.name}</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead>Équipe</TableHead>
                            <TableHead className="text-center">J</TableHead>
                            <TableHead className="text-center">G</TableHead>
                            <TableHead className="text-center">N</TableHead>
                            <TableHead className="text-center">P</TableHead>
                            <TableHead className="text-center">DB</TableHead>
                            <TableHead className="text-right">Pts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allStandings.map(s => (
                            <TableRow key={s.team.id}>
                                <TableCell className="font-bold">{s.rank}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Image src={s.team.logo} alt={s.team.name} width={20} height={20} data-ai-hint="sports logo"/>
                                        <span>{s.team.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{s.all.played}</TableCell>
                                <TableCell className="text-center">{s.all.win}</TableCell>
                                <TableCell className="text-center">{s.all.draw}</TableCell>
                                <TableCell className="text-center">{s.all.lose}</TableCell>
                                <TableCell className="text-center">{s.goalsDiff}</TableCell>
                                <TableCell className="text-right font-bold">{s.points}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


    