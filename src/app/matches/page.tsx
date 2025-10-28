
'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Search,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MatchFilterControls } from '@/components/match-filter-controls';
import { Star } from 'lucide-react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Card } from '@/components/ui/card';


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

type ApiTeam = {
  team: Team;
}

type GroupedMatches = Record<string, Record<string, ApiMatch[]>>;
type Favorite = { id: string };

const priorityCountries = ['World', 'England', 'Spain', 'Germany', 'Italy', 'France', 'Brazil', 'Argentina', 'Portugal', 'Netherlands'];


export default function MatchesPage() {
  const [matches, setMatches] = React.useState<ApiMatch[]>([]);
  const [groupedMatches, setGroupedMatches] = React.useState<GroupedMatches>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const isVip = false; // Mock vip status
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = React.useState<ApiTeam[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const favoritesQuery = firestore && user ? collection(firestore, `users/${user.uid}/favorites`) : null;
  const { data: favorites } = useCollection<Favorite>(favoritesQuery);
  const favoriteIds = React.useMemo(() => new Set(favorites?.map(f => f.id)), [favorites]);

  React.useEffect(() => {
    // This effect now solely reacts to the selectedDate changing.
    // The component re-renders when searchParams change.
    async function fetchMatches(date: string) {
      setIsLoading(true);
      setSearchQuery('');
      setSearchResults([]);
      try {
        const response = await fetch(`/api/matches?date=${date}`);
        if (!response.ok) {
          throw new Error('Failed to fetch matches');
        }
        const data = await response.json();
        const allMatches = data.matches || [];
        setMatches(allMatches);
        groupMatches(allMatches);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
        setMatches([]);
        setGroupedMatches({});
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMatches(selectedDate);
  }, [selectedDate]);
  
  const groupMatches = (matchesToGroup: ApiMatch[]) => {
      const grouped = matchesToGroup.reduce(
          (acc: GroupedMatches, match: ApiMatch) => {
            const country = match.league.country || 'Global';
            const leagueName = match.league.name;

            if (!acc[country]) {
              acc[country] = {};
            }
            if (!acc[country][leagueName]) {
              acc[country][leagueName] = [];
            }
            acc[country][leagueName].push(match);
            return acc;
          },
          {} as GroupedMatches
      );
      setGroupedMatches(grouped);
  }
  
  // Effect for live searching teams
  React.useEffect(() => {
    if (debouncedSearchQuery.length > 2) {
      const searchTeams = async () => {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/matches?teamSearch=${debouncedSearchQuery}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.teams || []);
          }
        } catch (error) {
          console.error("Failed to search teams:", error);
        } finally {
          setIsSearching(false);
        }
      };
      searchTeams();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);


  const sortedCountries = Object.entries(groupedMatches).sort(([a], [b]) => {
    const indexA = priorityCountries.indexOf(a);
    const indexB = priorityCountries.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB; // Both are in priority, sort by priority order
    }
    if (indexA !== -1) {
      return -1; // A is priority, B is not
    }
    if (indexB !== -1) {
      return 1; // B is priority, A is not
    }
    return a.localeCompare(b); // Neither is priority, sort alphabetically
  });
  
  const handleFavoriteToggle = async (e: React.MouseEvent, fixtureId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !firestore) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add favorites.",
        variant: "destructive",
      });
      return;
    }

    const fixtureIdStr = String(fixtureId);
    const isFavorite = favoriteIds.has(fixtureIdStr);
    const favoriteRef = doc(firestore, `users/${user.uid}/favorites/${fixtureIdStr}`);

    try {
      if (isFavorite) {
        await deleteDoc(favoriteRef);
        toast({ title: "Removed from favorites." });
      } else {
        await setDoc(favoriteRef, { addedAt: new Date() });
        toast({ title: "Added to favorites!" });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Could not update your favorites.",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Matches
          </h2>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 py-2 border-b">
         <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search for a team..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
           {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
           {searchResults.length > 0 && (
             <Card className='absolute top-full mt-1 w-full z-20'>
                <ul className='py-2'>
                  {searchResults.map(({ team }) => (
                    <li key={team.id}>
                       <Link href={`/team/${team.id}`} className='flex items-center gap-3 p-2 mx-2 rounded-md hover:bg-muted'>
                         <Image src={team.logo} alt={team.name} width={24} height={24} />
                         <span>{team.name}</span>
                       </Link>
                    </li>
                  ))}
                </ul>
             </Card>
           )}
        </div>
        <MatchFilterControls selectedDate={selectedDate} isVip={isVip} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
            <p>No matches found for this date.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full">
            {sortedCountries.map(([country, leagues]) => (
            <AccordionItem value={country} key={country}>
                <AccordionTrigger className="font-bold text-lg hover:no-underline">
                <div className="flex items-center gap-3">
                    {leagues[Object.keys(leagues)[0]][0].league.flag && (
                        <Image src={leagues[Object.keys(leagues)[0]][0].league.flag!} alt={`${country} flag`} width={32} height={20} className="rounded-sm object-cover" data-ai-hint="country flag" />
                    )}
                    {country}
                </div>
                </AccordionTrigger>
                <AccordionContent>
                <Accordion type="multiple" defaultValue={Object.keys(leagues)} className="w-full space-y-2">
                    {Object.entries(leagues).sort(([a], [b]) => a.localeCompare(b)).map(([league, leagueMatches]) => (
                    <AccordionItem value={league} key={league} className="border-none">
                        <AccordionTrigger className="bg-muted px-4 rounded-md hover:no-underline">
                        <div className="flex items-center gap-3">
                                <Image src={leagueMatches[0].league.logo} alt={`${league} logo`} width={24} height={24} className="rounded-full bg-white p-0.5" data-ai-hint="league logo" />
                                <span className="font-semibold">{league}</span>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 space-y-1">
                        {leagueMatches.sort((a,b) => a.fixture.timestamp - b.fixture.timestamp).map((match) => (
                            <Link href={`/predictions/${match.fixture.id}`} key={match.fixture.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="flex w-12 flex-col items-center justify-center text-xs text-muted-foreground">
                                    {match.fixture.status.short === 'NS' ? (
                                        <span>{new Date(match.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                    ) : (
                                        <span className="font-bold text-primary">{match.fixture.status.short}</span>
                                    )}
                                    {match.fixture.status.elapsed && (
                                        <span className='text-xs text-red-500 animate-pulse'>{match.fixture.status.elapsed}'</span>
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
                                {match.fixture.status.short !== 'NS' && (
                                    <div className="flex flex-col items-center font-mono text-lg font-bold">
                                        <span>{match.goals.home ?? '-'}</span>
                                        <span>{match.goals.away ?? '-'}</span>
                                    </div>
                                )}
                                <Button variant="ghost" size="icon" onClick={(e) => handleFavoriteToggle(e, match.fixture.id)} className="h-8 w-8">
                                    <Star className={cn(
                                        "h-5 w-5 text-muted-foreground/50 group-hover:text-yellow-400 transition-colors",
                                        favoriteIds.has(String(match.fixture.id)) && "text-yellow-400 fill-yellow-400"
                                    )} />
                                </Button>
                            </div>
                            </Link>
                        ))}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
                </AccordionContent>
            </AccordionItem>
            ))}
        </Accordion>
      )}
    </div>
  );
}
