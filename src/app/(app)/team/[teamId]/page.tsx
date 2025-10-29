
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart, FileText, Star, Users, List, Shield, Shirt, GanttChartSquare, Calendar, Building, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Team = { id: number; name: string; code: string; country: string; founded: number; national: boolean; logo: string; };
type Venue = { id: number; name: string; address: string; city: string; capacity: number; surface: string; image: string; };
type ApiTeamDetails = { team: Team; venue: Venue; };
type Player = { id: number; name: string; age: number; number: number | null; position: string; photo: string; };
type ApiSquad = { team: Team; players: Player[]; };

type ApiFixtureTeam = { id: number; name: string; logo: string; winner: boolean | null };
type ApiFixture = {
    fixture: { id: number; date: string; venue: { name: string; }; };
    league: { id: number; name: string; logo: string; round: string; };
    teams: { home: ApiFixtureTeam; away: ApiFixtureTeam; };
    goals: { home: number; away: number; };
};
type Standing = { rank: number; team: Team; points: number; goalsDiff: number; group: string; form: string; status: string; description: string | null; all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number; } } };
type ApiStandings = { league: { id: number; name: string; country: string; logo: string; flag: string; season: number; standings: Standing[][] } };


async function fetchFromApi(endpoint: string) {
    const API_HOST = "api-football.p.rapidapi.com";
    const API_KEY = process.env.FOOTBALL_API_KEY;
    
    if (!API_KEY) {
        console.error("API key is not configured.");
        return null;
    }
    try {
        // Using the internal API route to fetch data
        const baseUrl = process.env.NODE_ENV === 'production' ? 'https://<your-production-url>' : 'http://localhost:9002';
        const response = await fetch(`${baseUrl}/api/matches?${endpoint}`, { next: { revalidate: 3600 } });

        if (!response.ok) {
            console.error(`API request failed for ${endpoint} with status: ${response.status}`);
            return null;
        }
        return response.json();
    } catch (error) {
        console.error(`Failed to fetch from ${endpoint}:`, error);
        return null;
    }
}

export default async function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const teamData = await fetchFromApi(`team=${params.teamId}`);
  
  if (!teamData || !teamData.team) {
    notFound();
  }

  const teamDetails: ApiTeamDetails = teamData.team;
  
  const [squadData, fixturesData, standingsData] = await Promise.all([
      fetchFromApi(`squad=${params.teamId}`),
      fetchFromApi(`teamFixtures=${params.teamId}`),
      fetchFromApi(`standings=39&2023`) // Example: Premier League 2023. This should be dynamic.
  ]);

  const squad: ApiSquad | null = squadData?.squad;
  const fixtures: ApiFixture[] | null = fixturesData?.fixtures;
  const standings: ApiStandings[] | null = standingsData?.standings;

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/matches"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <div className='flex items-center gap-4'>
                <Image src={teamDetails.team.logo} alt={teamDetails.team.name} width={48} height={48} className="rounded-full bg-white p-1" />
                <h2 className="font-headline text-3xl font-bold tracking-tight">
                    {teamDetails.team.name}
                </h2>
            </div>
        </div>

        <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="squad">Effectif</TabsTrigger>
                <TabsTrigger value="fixtures">Matchs Récents</TabsTrigger>
                <TabsTrigger value="standings">Classement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4">
                <TeamDetails info={teamDetails} />
            </TabsContent>
            <TabsContent value="squad" className="mt-4">
                <SquadList squad={squad} />
            </TabsContent>
            <TabsContent value="fixtures" className="mt-4">
                <RecentFixtures fixtures={fixtures} teamId={parseInt(params.teamId, 10)} />
            </TabsContent>
            <TabsContent value="standings" className="mt-4">
                <LeagueStandings standings={standings} />
            </TabsContent>
        </Tabs>
    </div>
  );
}

function TeamDetails({ info }: { info: ApiTeamDetails }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Team Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
            <Image src={info.venue.image || 'https://picsum.photos/seed/venue/400/250'} alt={info.venue.name} width={400} height={250} className='rounded-lg object-cover w-1/3' data-ai-hint="stadium" />
            <div className='space-y-2 text-sm'>
                <p className='flex items-center gap-2'><Globe className='text-muted-foreground' /> <strong>Country:</strong> {info.team.country}</p>
                <p className='flex items-center gap-2'><Calendar className='text-muted-foreground' /> <strong>Founded:</strong> {info.team.founded}</p>
                <p className='flex items-center gap-2'><Building className='text-muted-foreground' /> <strong>Stadium:</strong> {info.venue.name}</p>
                <p className='flex items-center gap-2'><Users className='text-muted-foreground' /> <strong>Capacity:</strong> {info.venue.capacity.toLocaleString()}</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SquadList({ squad }: { squad: ApiSquad | null }) {
    if (!squad || squad.players.length === 0) {
        return <p className="text-muted-foreground text-center py-8">Squad information is not available.</p>;
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Shirt /> Squad List</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Number</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Age</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {squad.players.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className='font-medium flex items-center gap-2'>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.photo} alt={p.name} />
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {p.name}
                                </TableCell>
                                <TableCell>{p.number || '-'}</TableCell>
                                <TableCell>{p.position}</TableCell>
                                <TableCell>{p.age}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function RecentFixtures({ fixtures, teamId }: { fixtures: ApiFixture[] | null, teamId: number }) {
    if (!fixtures || fixtures.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No recent fixtures available.</p>;
    }
    return (
         <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Calendar /> Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
               {fixtures.map(({ fixture, teams, goals, league }) => (
                   <Link href={`/predictions/${fixture.id}`} key={fixture.id} className="block p-3 rounded-md hover:bg-muted/50">
                       <div className="text-xs text-muted-foreground">{league.name} - {format(new Date(fixture.date), 'dd MMM yyyy')}</div>
                       <div className="flex justify-between items-center">
                            <div className='flex items-center gap-2'>
                               <span className={cn(teams.home.id === teamId && teams.home.winner && "font-bold text-primary")}>{teams.home.name}</span> 
                               <span>vs</span>
                               <span className={cn(teams.away.id === teamId && teams.away.winner && "font-bold text-primary")}>{teams.away.name}</span>
                            </div>
                            <div className='font-bold text-lg'>{goals.home} - {goals.away}</div>
                       </div>
                   </Link>
               ))}
            </CardContent>
        </Card>
    );
}

function LeagueStandings({ standings }: { standings: ApiStandings[] | null }) {
    if (!standings || standings.length === 0) {
        return <p className="text-muted-foreground text-center py-8">Standings not available for this team's leagues.</p>;
    }
    return (
        <div className="space-y-4">
            {standings.map(s => (
                <Card key={s.league.id}>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                             <Image src={s.league.logo} alt={s.league.name} width={24} height={24} />
                             {s.league.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {s.league.standings[0] && (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead>P</TableHead>
                                        <TableHead>W</TableHead>
                                        <TableHead>D</TableHead>
                                        <TableHead>L</TableHead>
                                        <TableHead>GD</TableHead>
                                        <TableHead className='text-right'>Pts</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {s.league.standings[0].map(pos => (
                                        <TableRow key={pos.team.id}>
                                            <TableCell>{pos.rank}</TableCell>
                                            <TableCell className='flex items-center gap-2'>
                                                <Image src={pos.team.logo} alt={pos.team.name} width={20} height={20} />
                                                {pos.team.name}
                                            </TableCell>
                                            <TableCell>{pos.all.played}</TableCell>
                                            <TableCell>{pos.all.win}</TableCell>
                                            <TableCell>{pos.all.draw}</TableCell>
                                            <TableCell>{pos.all.lose}</TableCell>
                                            <TableCell>{pos.goalsDiff}</TableCell>
                                            <TableCell className='font-bold text-right'>{pos.points}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
