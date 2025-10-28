'use client';

import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, ArrowLeft, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { MatchCard } from '@/components/match-card';


type Favorite = { id: string; addedAt: any };

type ApiMatchResponse = {
  fixture: { id: number; date: string; };
  league: { name: string; };
  teams: { home: { name: string; }; away: { name: string; }; };
}

function mapApiMatchToPrediction(apiMatch: ApiMatchResponse): MatchPrediction {
    return {
        fixture_id: apiMatch.fixture.id,
        match: `${apiMatch.teams.home.name} vs ${apiMatch.teams.away.name}`,
        home_team: apiMatch.teams.home.name,
        away_team: apiMatch.teams.away.name,
        league: apiMatch.league.name,
        time: apiMatch.fixture.date,
        prediction: 'N/A', // No prediction available for favorites from API
        odds: 0,
        confidence: 0,
    }
}


export default function FavoriteMatchesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [favoriteMatches, setFavoriteMatches] = React.useState<MatchPrediction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const favoritesQuery = firestore && user ? collection(firestore, `users/${user.uid}/favorites`) : null;
  const { data: favorites, loading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);

  React.useEffect(() => {
    // This effect will run when the favorites list is loaded or changed.
    const fetchMatchDetails = async () => {
      if (favoritesLoading) {
        // Still waiting for the list of IDs
        setIsLoading(true);
        return;
      }

      if (!favorites || favorites.length === 0) {
        // No favorites, so nothing to fetch
        setFavoriteMatches([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const favoriteIds = favorites.map(f => f.id);
      
      try {
        // Fetch all match details in parallel
        const matchPromises = favoriteIds.map(async (id) => {
          const response = await fetch(`/api/matches?id=${id}`);
          if (response.ok) {
            const data = await response.json();
            const matchData: ApiMatchResponse = data.matches?.[0];
            if (matchData) {
              return mapApiMatchToPrediction(matchData);
            }
          }
          return null; // Return null for failed fetches
        });

        const matches = (await Promise.all(matchPromises)).filter(Boolean) as MatchPrediction[];
        setFavoriteMatches(matches);

      } catch (error) {
        console.error("Failed to fetch favorite matches:", error);
        setFavoriteMatches([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatchDetails();

  }, [favorites, favoritesLoading]);

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
      ) : favoriteMatches.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>You haven't added any matches to your favorites yet.</p>
          <p className="text-sm">Click the star icon next to a match to add it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favoriteMatches.map((match) => (
            <MatchCard key={match.fixture_id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
