
'use client';
import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import type { MatchPrediction } from "@/ai/schemas/prediction-schemas";

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
};


const useVipStatus = (user: any) => {
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const userQuery = firestore && user ? query(collection(firestore, 'users'), where('uid', '==', user.uid)) : null;
  const { data: userData, loading: userDataLoading } = useCollection<{ isVip?: boolean }>(userQuery);

  useEffect(() => {
    if (!userDataLoading) {
      setIsVip(userData?.[0]?.isVip || false);
      setLoading(false);
    }
  }, [userData, userDataLoading]);

  return { isVip, loading };
};


export default function SubscriptionPage() {
  const { user, loading: userLoading } = useUser();
  const { isVip, loading: vipLoading } = useVipStatus(user);
  const router = useRouter();
  const firestore = useFirestore();
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: vipCategory, loading: predictionsLoading } = useCollection<PredictionCategoryDoc>(
      firestore ? query(collection(firestore, `predictions/${today}/categories`), where('id', 'in', ['individual_vip', 'exclusive_vip_1', 'exclusive_vip_2', 'exclusive_vip_3', 'secure_trial']), where('status', '==', 'published')) : null
  );

  const vipPredictions = useMemo(() => {
    if (!vipCategory) return [];
    // Flatten predictions from all fetched VIP categories
    return vipCategory.flatMap(cat => cat.predictions);
  }, [vipCategory]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);
  
  const isLoading = userLoading || vipLoading || predictionsLoading;
  
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
         <Button asChild variant="outline" size="icon" className="md:hidden">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h2 className="font-headline text-3xl font-bold tracking-tight text-yellow-700 dark:text-yellow-400">Subscription Predictions</h2>
        </div>
      </div>
      <p className="text-muted-foreground">
        Access our highest-accuracy predictions, available only to subscribers.
      </p>
      
      {isVip ? (
        vipPredictions.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vipPredictions.map((match) => (
              <MatchCard key={match.fixture_id} match={match} isVip />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No premium predictions available for today. Please check back later.
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="mt-8 border-yellow-500/50 bg-gradient-to-br from-yellow-300/20 to-transparent">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-yellow-500/20 p-4">
                    <Lock className="h-12 w-12 text-yellow-600"/>
                </div>
                <h3 className="mt-6 font-headline text-2xl font-bold text-yellow-800">This Content is Locked</h3>
                <p className="mt-2 max-w-md text-yellow-700/80">
                    You must have an active subscription to view these premium predictions. Upgrade your plan to unlock instant access.
                </p>
                <Button asChild className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg">
                    <Link href="/payments">
                        Upgrade
                        <Crown className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
