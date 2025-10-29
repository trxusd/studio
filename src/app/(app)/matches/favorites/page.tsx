
'use client';

import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, doc, deleteDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Favorite = { id: string; addedAt: any };

type Team = { id: number; name: string; logo: string; };
type League = { id: number; name: string; country: string; logo: string; flag: string | null; };
type Fixture = { id: number; date: string; status: { short: string; elapsed: number | null; }; };
type ApiMatchResponse = {
  fixture: Fixture;
  league: League;
  teams: { home: Team; away: Team; };
  goals: { home: number | null; away: number | null; };
};

type FavoriteMatch = {
    fixture_id: number;
    match: string;
    home_team: string;
    home_team_logo: string;
    away_team: string;
    away_team_logo: string;
    league: string;
    time: string;
    country: string;
    leagueLogo: string;
};

type GroupedMatches = Record<string, Record<string, FavoriteMatch[]>>;

function mapApiMatchToFavoriteMatch(apiMatch: ApiMatchResponse): FavoriteMatch {
    return {
        fixture_id: apiMatch.fixture.id,
        match: `${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name}`,
        home_team: apiMatch.teams.home.name,
        home_team_logo: apiMatch.teams.home.logo,
        away_team: apiMatch.teams.away.name,
        away_team_logo: apiMatch.teams.away.logo,
        league: apiMatch.league.name,
        time: apiMatch.fixture.date,
        country: apiMatch.league.country,
        leagueLogo: apiMatch.league.logo,
    };
}

export default function FavoriteMatchesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [groupedMatches, setGroupedMatches] = React.useState<GroupedMatches>({});
  const [isLoading, setIsLoading] = React.useState(true);

  const favoritesQuery = firestore && user ? query(collection(firestore, `users/${user.uid}/favorites`)) : null;
  const { data: favorites, loading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);

  React.useEffect(() => {
    async function fetchAndGroupMatches() {
      if (favoritesLoading) {
        setIsLoading(true);
        return;
      }

      if (!favorites || favorites.length === 0) {
        setGroupedMatches({});
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const idsToFetch = favorites.map(f => f.id);
      
      try {
        const matchPromises = idsToFetch.map(async (id) => {
          const response = await fetch(`/api/matches?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            return data.matches?.[0] ? mapApiMatchToFavoriteMatch(data.matches[0]) : null;
          }
          return null;
        });

        const matches = (await Promise.all(matchPromises)).filter(Boolean) as FavoriteMatch[];
        
        const grouped = matches.reduce((acc: GroupedMatches, match: FavoriteMatch) => {
          const country = match.country || 'Global';
          const leagueName = match.league;
          if (!acc[country]) acc[country] = {};
          if (!acc[country][leagueName]) acc[country][leagueName] = [];
          acc[country][leagueName].push(match);
          return acc;
        }, {} as GroupedMatches);
        setGroupedMatches(grouped);

      } catch (error) {
        console.error("Failed to fetch favorite matches:", error);
        setGroupedMatches({});
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchAndGroupMatches();
  }, [favorites, favoritesLoading]);

  const handleFavoriteToggle = async (e: React.MouseEvent, fixtureId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !firestore) return;

    const fixtureIdStr = String(fixtureId);
    const favoriteRef = doc(firestore, `users/${user.uid}/favorites/${fixtureIdStr}`);

    try {
        await deleteDoc(favoriteRef);
        toast({ title: "Removed from favorites." });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Could not remove from your favorites.",
        variant: "destructive"
      });
    }
  };

  const sortedCountries = Object.entries(groupedMatches).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <Star className="text-yellow-400" /> Favorite Matches
        </h2>
        <Button variant="outline" asChild>
          <Link href="/matches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Matches
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : favorites?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't added any matches to your favorites yet.</p>
          <p className="text-sm">Click the star icon next to a match to add it here.</p>
        </div>
      ) : (
        <Accordion type="multiple" className="w-full" defaultValue={sortedCountries.map(([country]) => country)}>
          {sortedCountries.map(([country, leagues]) => (
            <AccordionItem value={country} key={country}>
              <AccordionTrigger className="font-bold text-lg hover:no-underline">{country}</AccordionTrigger>
              <AccordionContent>
                {Object.entries(leagues).map(([leagueName, leagueMatches]) => (
                  <div key={leagueName} className="mb-4">
                    <h4 className='font-semibold text-md mb-2 flex items-center gap-2 px-4'>
                      {leagueMatches[0]?.leagueLogo && 
                        <Image src={leagueMatches[0].leagueLogo} alt={`${leagueName} logo`} width={24} height={24} className="rounded-full bg-white p-0.5" data-ai-hint="league logo" />
                      }
                      {leagueName}
                    </h4>
                    <div className='space-y-1'>
                      {leagueMatches.map(match => (
                        <Link href={`/match/${match.fixture_id}`} key={match.fixture_id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-4">
                             <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <Image src={match.home_team_logo} alt={match.home_team} width={20} height={20} data-ai-hint="sports logo" />
                                <span className="font-medium">{match.home_team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Image src={match.away_team_logo} alt={match.away_team} width={20} height={20} data-ai-hint="sports logo" />
                                <span className="font-medium">{match.away_team}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={(e) => handleFavoriteToggle(e, match.fixture_id)} className="h-8 w-8">
                              <Star className={cn(
                                  "h-5 w-5 text-yellow-400 fill-yellow-400 transition-colors"
                              )} />
                          </Button>
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
