
'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Radio,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Team = { id: number; name: string; logo: string; };
type League = { id: number; name: string; country: string; logo: string; flag: string | null; season: number; };
type Fixture = { id: number; referee: string | null; timezone: string; date: string; timestamp: number; periods: { first: number | null; second: number | null; }; venue: { id: number | null; name: string | null; city: string | null; }; status: { long: string; short: string; elapsed: number | null; }; };
type ApiMatch = { fixture: Fixture; league: League; teams: { home: Team; away: Team; }; goals: { home: number | null; away: number | null; }; score: any; };
type GroupedMatches = Record<string, Record<string, ApiMatch[]>>;


export default function LiveMatchesPage() {
    const [liveMatches, setLiveMatches] = React.useState<ApiMatch[]>([]);
    const [groupedMatches, setGroupedMatches] = React.useState<GroupedMatches>({});
    const [isLoading, setIsLoading] = React.useState(true);

    async function fetchLiveMatches() {
        setIsLoading(true);
        try {
            // The API route needs to support `live=all`
            const response = await fetch(`/api/matches?live=all`);
            if (!response.ok) {
                throw new Error('Failed to fetch live matches');
            }
            const data = await response.json();
            const allMatches = data.matches || [];
            setLiveMatches(allMatches);

            // Group matches
            const grouped = allMatches.reduce((acc: GroupedMatches, match: ApiMatch) => {
                const country = match.league.country || 'Global';
                const leagueName = match.league.name;
                if (!acc[country]) acc[country] = {};
                if (!acc[country][leagueName]) acc[country][leagueName] = [];
                acc[country][leagueName].push(match);
                return acc;
            }, {} as GroupedMatches);
            setGroupedMatches(grouped);

        } catch (error) {
            console.error("Failed to fetch live matches:", error);
            setLiveMatches([]);
            setGroupedMatches({});
        } finally {
            setIsLoading(false);
        }
    }

    React.useEffect(() => {
        fetchLiveMatches();
        const interval = setInterval(fetchLiveMatches, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const sortedCountries = Object.entries(groupedMatches).sort(([a], [b]) => a.localeCompare(b));


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center justify-between">
            <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
                <Radio className="text-red-500 animate-pulse" /> Live Matches
            </h2>
            <Button variant="outline" asChild>
                <Link href="/matches"><ArrowLeft className='h-4 w-4 mr-2' />Back to All Matches</Link>
            </Button>
        </div>

      {isLoading && liveMatches.length === 0 ? (
         <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : liveMatches.length === 0 ? (
         <div className="text-center py-12 text-muted-foreground">
            <p>No live matches currently in progress.</p>
        </div>
      ) : (
         <Accordion type="multiple" className="w-full" defaultValue={sortedCountries.map(([country]) => country)}>
            {sortedCountries.map(([country, leagues]) => (
                 <AccordionItem value={country} key={country}>
                    <AccordionTrigger className="font-bold text-lg hover:no-underline">{country}</AccordionTrigger>
                    <AccordionContent>
                        {Object.entries(leagues).map(([league, leagueMatches]) => (
                            <div key={league} className="mb-4">
                               <h4 className='font-semibold text-md mb-2 flex items-center gap-2 px-4'>
                                    <Image src={leagueMatches[0].league.logo} alt={`${league} logo`} width={24} height={24} className="rounded-full bg-white p-0.5" data-ai-hint="league logo" />
                                   {league}
                               </h4>
                               <div className='space-y-1'>
                                {leagueMatches.map(match => (
                                     <Link href={`/predictions/${match.fixture.id}`} key={match.fixture.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                                         <div className="flex items-center gap-4">
                                            <div className="flex w-12 flex-col items-center justify-center text-xs text-red-500 font-bold">
                                               <span>{match.fixture.status.short}</span>
                                               {match.fixture.status.elapsed && (
                                                   <span className='animate-pulse'>{match.fixture.status.elapsed}'</span>
                                               )}
                                           </div>
                                           <div className="flex flex-col gap-2">
                                               <div className="flex items-center gap-2">
                                                   <Image src={match.teams.home.logo} alt={match.teams.home.name} width={20} height={20} data-ai-hint="sports logo" />
                                                   <span className="font-medium">{match.teams.home.name}</span>
                                               </div>
                                               <div className="flex items-center gap-2">
                                                   <Image src={match.teams.away.logo} alt={match.teams.away.name} width={20} height={20} data-ai-hint="sports logo" />
                                                   <span className="font-medium">{match.teams.away.name}</span>
                                               </div>
                                           </div>
                                         </div>
                                        <div className="flex items-center gap-4">
                                             <div className="flex flex-col items-center font-mono text-lg font-bold">
                                               <span>{match.goals.home ?? '-'}</span>
                                               <span>{match.goals.away ?? '-'}</span>
                                           </div>
                                        </div>
                                     </Link>
                                ))}
                               </div>
                            </div>
                        ))}
                    </AccordionContent>
                 </AccordionItem>
            ))}
         </Accordion>
      )}
    </div>
  );
}
