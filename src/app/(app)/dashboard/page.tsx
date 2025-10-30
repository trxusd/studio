
'use client';

import { useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Crown, LifeBuoy, Loader2, ShieldCheck, Ticket, Calendar } from "lucide-react";
import Link from 'next/link';
import { MatchCard } from "@/components/match-card";
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, Timestamp, getDocs, doc } from 'firebase/firestore';
import { type MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { useState, useEffect } from 'react';
import { NavMenu } from '@/components/nav-menu';

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
};

type PredictionResult = MatchPrediction & {
  status: 'Win' | 'Loss' | 'Pending';
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [stats, setStats] = useState({ wins: 0, accuracy: 0 });
  const [statsLoading, setStatsLoading] = useState(false); // Set to false initially
  const [today, setToday] = useState('');


  useEffect(() => {
    // Set date on client-side to avoid hydration mismatch
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  // Fetch user's VIP status
  const userQuery = firestore && user ? query(collection(firestore, 'users'), where('uid', '==', user.uid)) : null;
  const { data: userData, loading: userDataLoading } = useCollection<{ isVip?: boolean; vipPlan?: string }>(userQuery);
  const vipStatus = userData?.[0];

  // Fetch today's predictions
  const categoriesQuery = firestore && today ? query(collection(firestore, `predictions/${today}/categories`), where("status", "==", "published")) : null;
  const { data: publishedCategories, loading: predictionsLoading } = useCollection<PredictionCategoryDoc>(categoriesQuery);
  
  // useEffect(() => {
  //   async function fetchStats() {
  //     if (!firestore) {
  //       setStatsLoading(false);
  //       return;
  //     };

  //     setStatsLoading(true);
  //     try {
  //         let allPredictions: PredictionResult[] = [];
  //         for (let i = 0; i < 7; i++) {
  //             const date = new Date();
  //             date.setDate(date.getDate() - i);
  //             const dateString = date.toISOString().split('T')[0];

  //             const categoriesColRef = collection(firestore, `predictions/${dateString}/categories`);
  //             const querySnapshot = await getDocs(categoriesColRef);

  //             querySnapshot.forEach(doc => {
  //                 const category = doc.data();
  //                 // SAFEGUARD: Ensure category and category.predictions exist and is an array
  //                 if (category && Array.isArray(category.predictions)) {
  //                     allPredictions.push(...category.predictions as PredictionResult[]);
  //                 }
  //             });
  //         }
          
  //         let totalWins = 0;
  //         let totalResolved = 0;

  //         allPredictions.forEach(pred => {
  //             if (pred.status === 'Win') {
  //                 totalWins++;
  //                 totalResolved++;
  //             } else if (pred.status === 'Loss') {
  //                 totalResolved++;
  //             }
  //         });

  //         const accuracy = totalResolved > 0 ? (totalWins / totalResolved) * 100 : 0;
  //         setStats({ wins: totalWins, accuracy: parseFloat(accuracy.toFixed(1)) });

  //     } catch (error) {
  //         console.error("Error fetching stats:", error);
  //         setStats({ wins: 0, accuracy: 0 });
  //     } finally {
  //         setStatsLoading(false);
  //     }
  //   }

  //   if (firestore) {
  //       fetchStats();
  //   }
  // }, [firestore]);


  const { activePredictionsCount, topEvents } = useMemo(() => {
    if (!publishedCategories) return { activePredictionsCount: 0, topEvents: [] };

    let count = 0;
    const allPublished: MatchPrediction[] = [];

    for (const cat of publishedCategories) {
        count += cat.predictions.length;
        allPublished.push(...cat.predictions);
    }
    
    // Sort all matches by confidence to find the "best" ones
    const sortedMatches = allPublished.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    
    return { activePredictionsCount: count, topEvents: sortedMatches.slice(0, 2) };

  }, [publishedCategories]);

  const isLoading = userLoading || userDataLoading || predictionsLoading || statsLoading || !today;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/*
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions Won</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wins}</div>
            <p className="text-xs text-muted-foreground">In the last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">In the last 7 days</p>
          </CardContent>
        </Card>
        */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
             <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{activePredictionsCount}</div>
            <p className="text-xs text-muted-foreground">Available today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipStatus?.isVip ? vipStatus.vipPlan || 'Active' : 'Free Plan'}</div>
            <p className="text-xs text-muted-foreground">{vipStatus?.isVip ? 'You have full access' : 'Upgrade for premium predictions'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Calendar /> Today's Events</CardTitle>
            <CardDescription>
              Here are the top matches available for today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEvents.length > 0 ? (
                topEvents.map((match, index) => (
                  <MatchCard key={`${match.fixture_id}-${index}`} match={match} />
                ))
            ) : (
                <p className="text-center text-muted-foreground py-8">No highlight events available today. Check back later!</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/predictions">View All Predictions <ArrowUpRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3 bg-yellow-500 text-black">
           <CardHeader>
             <div className="flex items-center gap-2">
                <Crown />
                <CardTitle className="font-headline">Unlock Premium Access</CardTitle>
             </div>
            <CardDescription className="text-black/80">
              Get exclusive access to our most accurate, AI-powered predictions and in-depth analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-black/90">
                <li>Premium match predictions with higher accuracy.</li>
                <li>In-depth statistical analysis and insights.</li>
                <li>Access to the exclusive VIP community chat.</li>
                <li>Real-time alerts and betting signals.</li>
            </ul>
            <div className="mt-6">
                <h4 className="font-semibold">Your Progress</h4>
                <Progress value={vipStatus?.isVip ? 100 : 25} className="w-full mt-2 [&>div]:bg-yellow-300 bg-black/20" />
                <p className="text-xs text-black/80 mt-1">{vipStatus?.isVip ? "You're in the winner's circle!" : "You're one step away from joining."}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-bold shadow-lg" disabled={!!vipStatus?.isVip}>
                <Link href="/payments">
                    {vipStatus?.isVip ? 'Subscription Active' : 'Upgrade Now'}
                    <Crown className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
        
      <NavMenu />

    </div>
  );
}
