
'use client';
import { MatchCard } from "@/components/match-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { matches } from "@/lib/data";
import { Crown, Lock, Loader2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock subscription status. In a real app, this would come from your database.
const useVipStatus = (user: any) => {
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching subscription status
    if (user) {
      // In a real app, you'd fetch this from Firestore:
      // const userDoc = await getDoc(doc(firestore, "users", user.uid));
      // setIsVip(userDoc.data()?.isVip || false);
      
      // For now, we'll just mock it.
      // Let's say every other user is a VIP for demonstration.
      // A simple mock logic:
      const isUserVip = true; // you can change this to false to see the locked state
      setIsVip(isUserVip);

    } else {
      setIsVip(false);
    }
    setLoading(false);
  }, [user]);

  return { isVip, loading: loading };
};


export default function VipPredictionsPage() {
  const { user, loading: userLoading } = useUser();
  const { isVip, loading: vipLoading } = useVipStatus(user);
  const router = useRouter();
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);
  
  if (userLoading || vipLoading || !user) {
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
            <h2 className="font-headline text-3xl font-bold tracking-tight text-yellow-700 dark:text-yellow-400">VIP Predictions</h2>
        </div>
      </div>
      <p className="text-muted-foreground">
        Access our highest-accuracy predictions, available only to VIP members.
      </p>
      
      {isVip ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {matches.map((match) => (
            <MatchCard key={match.fixture_id} match={match} isVip />
          ))}
        </div>
      ) : (
        <Card className="mt-8 border-yellow-500/50 bg-gradient-to-br from-yellow-300/20 to-transparent">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-yellow-500/20 p-4">
                    <Lock className="h-12 w-12 text-yellow-600"/>
                </div>
                <h3 className="mt-6 font-headline text-2xl font-bold text-yellow-800">This Content is Locked</h3>
                <p className="mt-2 max-w-md text-yellow-700/80">
                    You must be a VIP member to view these premium predictions. Upgrade your plan to unlock instant access.
                </p>
                <Button asChild className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg">
                    <Link href="/payments">
                        Upgrade to VIP
                        <Crown className="ml-2 h-4 w-4"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
