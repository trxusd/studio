
'use client';

import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { MatchCard } from '@/components/match-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Favorite = {
    id: string; // Corresponds to fixtureId
};

type ApiMatch = {
    fixture: { id: number; date: string; };
    league: { name: string; };
    teams: { home: { name: string; }; away: { name: string; }; };
};

export default function FavoriteMatchesPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [favoriteMatches, setFavoriteMatches] = React.useState<MatchPrediction[]>([]);
    const [detailsLoading, setDetailsLoading] = React.useState(true);

    const favoritesQuery = firestore && user ? collection(firestore, `users/${user.uid}/favorites`) : null;
    const { data: favorites, loading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);
    
    React.useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    React.useEffect(() => {
        const fetchMatchDetails = async () => {
            if (favoritesLoading || !favorites) {
                // If still loading or no favorites data, do nothing yet.
                // If not loading and favorites is empty array, it will be handled below.
                if(!favoritesLoading && !favorites) {
                    setFavoriteMatches([]);
                    setDetailsLoading(false);
                }
                return;
            }

            const favoriteIds = favorites.map(f => f.id);

            if (favoriteIds.length === 0) {
                setFavoriteMatches([]);
                setDetailsLoading(false);
                return;
            }
            
            setDetailsLoading(true);
            const matchPromises = favoriteIds.map(async (id) => {
                try {
                    const response = await fetch(`/api/matches?id=${id}`);
                    if (response.ok) {
                        const data = await response.json();
                        const matchData: ApiMatch = data.matches?.[0];
                        if (matchData) {
                             return {
                                fixture_id: matchData.fixture.id,
                                match: `${matchData.teams.home.name} vs ${matchData.teams.away.name}`,
                                home_team: matchData.teams.home.name,
                                away_team: matchData.teams.away.name,
                                league: matchData.league.name,
                                time: matchData.fixture.date,
                                prediction: 'View Details',
                                odds: 1.0,
                                confidence: 0,
                            } as MatchPrediction;
                        }
                    }
                } catch (error) {
                    console.error(`Failed to fetch details for match ${id}`, error);
                }
                return null;
            });

            const matches = await Promise.all(matchPromises);
            setFavoriteMatches(matches.filter((m): m is MatchPrediction => m !== null));
            setDetailsLoading(false);
        };

        fetchMatchDetails();
    }, [favorites, favoritesLoading]);
    
    const isLoading = userLoading || favoritesLoading || detailsLoading;

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Star className="text-yellow-400" /> Favorite Matches
                </h2>
                <Button variant="outline" asChild>
                    <Link href="/matches">Back to All Matches</Link>
                </Button>
            </div>

            {isLoading ? (
                 <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : favoriteMatches.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {favoriteMatches.map(match => (
                        <MatchCard key={match.fixture_id} match={match} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>No Favorite Matches</CardTitle>
                        <CardDescription>Matches you mark as favorite will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">You haven't added any matches to your favorites yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
