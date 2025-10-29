
'use client';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { Loader2, ArrowLeft, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { type MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { format } from 'date-fns';

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
    category: string;
};

const categoryTitles: Record<string, string> = {
    secure_trial: 'Secure Trial',
    free_coupon: 'Free Coupon',
    exclusive_vip_1: 'Koupon VIP 1',
    exclusive_vip_2: 'Koupon VIP 2',
    exclusive_vip_3: 'Koupon VIP 3',
};


export default function CouponDetailPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.categoryId as string;
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();

    const today = new Date().toISOString().split('T')[0];
    
    const categoryDocRef = firestore ? doc(firestore, `predictions/${today}/categories/${categoryId}`) : null;
    const { data: category, loading: categoryLoading } = useDoc<PredictionCategoryDoc>(categoryDocRef);
    
    const isLoading = userLoading || categoryLoading;

    const totalOdds = useMemo(() => {
        if (!category?.predictions || category.predictions.length === 0) {
            return 1;
        }
        return category.predictions.reduce((acc, pred) => acc * (pred.odds || 1), 1);
    }, [category]);

    useEffect(() => {
        if (!isLoading && !category) {
            // Instead of notFound(), we redirect the user.
            router.push('/predictions');
        }
    }, [isLoading, category, router]);
    
    if (isLoading) {
        return (
          <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
        );
    }
    
    // If category is still null/undefined after loading, it means the useEffect will trigger a redirect.
    // We can return null or a loading state to prevent rendering the rest of the component.
    if (!category) {
        return (
             <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
             </div>
        );
    }
    
    const pageTitle = categoryTitles[category.id] || 'Coupon Details';

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
             <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/predictions"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h2 className="font-headline text-3xl font-bold tracking-tight">
                   {pageTitle}
                </h2>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Match List</CardTitle>
                            <CardDescription>Predictions for {format(new Date(), "eeee, MMMM do, yyyy")}</CardDescription>
                        </div>
                        <div className="text-right">
                             <p className="text-sm text-muted-foreground">Total Odds:</p>
                             <p className="text-3xl font-bold text-primary">{totalOdds.toFixed(2)}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {category.predictions.map((match, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground flex flex-col items-center">
                                    <Clock className="h-4 w-4 mb-1" />
                                    <span>{format(new Date(match.time), "HH:mm")}</span>
                                </div>
                                <div>
                                    <p className="font-semibold">{match.home_team}</p>
                                    <p className="font-semibold">vs {match.away_team}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <p className="text-sm font-medium text-right">{match.prediction}</p>
                                <Badge className="text-base font-bold min-w-[60px] flex justify-center bg-primary text-primary-foreground">{match.odds.toFixed(2)}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="bg-transparent border-dashed">
                <CardContent className="text-center text-muted-foreground text-sm p-6">
                    <p>All predictions are carefully analyzed by our expert team.</p>
                    <p>Bet responsibly. Odds are subject to change.</p>
                </CardContent>
            </Card>

        </div>
    )
}
