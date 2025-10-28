
'use client';

import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

// We need to add league and country to the prediction type for grouping
type FavoriteMatch = MatchPrediction & { country: string; leagueLogo: string; };

type GroupedMatches = Record<string, Record<string, FavoriteMatch[]>>;

function mapApiMatchToFavoriteMatch(apiMatch: ApiMatchResponse): FavoriteMatch {
    return {
        fixture_id: apiMatch.fixture.id,
        match: `${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name}`,
        home_team: apiMatch.teams.home.name,
        away_team: apiMatch.teams.away.name,
        league: apiMatch.league.name,
        time: apiMatch.fixture.date,
        prediction: 'N/A',
        odds: 0,
        confidence: 0,
        country: apiMatch.league.country,
        leagueLogo: apiMatch.league.logo,
    };
}


export default function FavoriteMatchesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [groupedMatches, setGroupedMatches] = React.useState<GroupedMatches>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [totalFavorites, setTotalFavorites] = React.useState(0);

  const favoritesQuery = firestore && user ? query(collection(firestore, `users/${user.uid}/favorites`)) : null;
  const { data: favorites, loading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);

  React.useEffect(() => {
    // This effect will run whenever the loading state of favorites changes,
    // or when the favorites themselves change.
    const fetchMatchDetails = async () => {
      // Exit if we are still loading favorites or have no favorites to fetch.
      if (!favorites) {
        setIsLoading(false);
        setGroupedMatches({});
        setTotalFavorites(0);
        return;
      }
      
      setTotalFavorites(favorites.length);
      if(favorites.length === 0) {
        setIsLoading(false);
        setGroupedMatches({});
        return;
      }
      
      const favoriteIds = favorites.map(f => f.id);
      
      try {
        const matchPromises = favoriteIds.map(async (id) => {
          const response = await fetch(`/api/matches?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            const matchData: ApiMatchResponse | undefined = data.matches?.[0];
            if (matchData) {
              return mapApiMatchToFavoriteMatch(matchData);
            }
          }
          return null;
        });

        const matches = (await Promise.all(matchPromises)).filter(Boolean) as FavoriteMatch[];
        
        // Group matches logic
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
    };
    
    if (!favoritesLoading) {
      fetchMatchDetails();
    }

  }, [favorites, favoritesLoading]);

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

      {(isLoading || favoritesLoading) ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : totalFavorites === 0 ? (
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
                        <Link href={`/predictions/${match.fixture_id}`} key={match.fixture_id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{match.home_team}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{match.away_team}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
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
