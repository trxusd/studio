
'use client';

import * as React from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

type Favorite = {
    id: string; // Corresponds to fixtureId
};

export default function FavoriteMatchesPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const favoritesQuery = firestore && user ? collection(firestore, `users/${user.uid}/favorites`) : null;
    const { data: favorites, loading: favoritesLoading } = useCollection<Favorite>(favoritesQuery);
    
    // In a real app, you would fetch match details for each favorite ID.
    // For this example, we'll just show that the feature is connected.
    // We'll simulate fetching match data.

    React.useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const isLoading = userLoading || favoritesLoading;
    
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
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Favorite Matches</CardTitle>
                        <CardDescription>Matches you've marked as favorite will appear here.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        {favorites && favorites.length > 0 ? (
                             <ul className='list-disc list-inside'>
                                {favorites.map(fav => (
                                    <li key={fav.id}>Match ID: {fav.id} (Details would be fetched here)</li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-muted-foreground text-center">You haven't added any matches to your favorites yet.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
