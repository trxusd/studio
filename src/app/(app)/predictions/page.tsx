
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ticket, ShieldCheck, List, Crown, Lock, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { type MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { Skeleton } from '@/components/ui/skeleton';

// Custom hook to get real-time VIP status
const useVipStatus = (user: any) => {
  const [isVip, setIsVip] = useState(false);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const userQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users'), where('uid', '==', user.uid));
  }, [user, firestore]);
  
  const { data: userData, loading: userLoadingHook } = useCollection<{ isVip?: boolean }>(userQuery);

  useEffect(() => {
    if (userLoadingHook) {
      setLoading(true);
    } else {
      setIsVip(!!userData?.[0]?.isVip);
      setLoading(false);
    }
  }, [userData, userLoadingHook]);

  return { isVip, loading };
};

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
    category: string;
};

const renderMatch = (match: MatchPrediction, index: number) => (
  <div key={index} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50">
    <div className="flex-1 truncate pr-2">
      <p className="font-medium truncate">{match.match}</p>
      <p className="text-muted-foreground">{match.prediction}</p>
    </div>
    <Badge variant="secondary" className="font-bold">{match.odds?.toFixed(2)}</Badge>
  </div>
);

const renderCouponCard = (id: string, title: string, description: string, icon: React.ReactNode, matches: MatchPrediction[], isVipCard = false) => {
    if (!matches || matches.length === 0) return null;
    return (
        <Link href={`/predictions/coupon/${id}`} passHref className="h-full block">
            <Card className={
                `hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col h-full cursor-pointer 
                ${isVipCard ? 'border-yellow-500/30 bg-yellow-400/5' : ''}`
            }>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        {icon}
                        <span>{title}</span>
                    </CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-1">
                    {matches.map(renderMatch)}
                </CardContent>
            </Card>
        </Link>
    );
}

const LockedVipCard = ({ title }: { title: string }) => (
    <Card className="border-yellow-500/30 bg-yellow-400/5 flex flex-col justify-center">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full">
            <Lock className="h-6 w-6 mb-2"/>
            <p className="font-semibold">{title}</p>
            <p className="text-sm">This section is for VIP members only.</p>
            <Button asChild variant="link" className="text-primary h-auto p-0 mt-1">
                <Link href="/payments">Go VIP</Link>
            </Button>
        </CardContent>
    </Card>
);

const VipSectionSkeleton = () => (
    <>
        <Card className="border-yellow-500/30 bg-yellow-400/5">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-400/5">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
        <Card className="border-yellow-500/30 bg-yellow-400/5">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    </>
);

const PaidSectionContent = ({ predictions, isVip, isLoading }: { predictions: any, isVip: boolean, isLoading: boolean }) => {
    if (isLoading) {
        return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><VipSectionSkeleton /></div>;
    }

    if (!isVip) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {predictions.exclusive_vip_1.length > 0 && <LockedVipCard title="Exclusive VIP 1" />}
                {predictions.exclusive_vip_2.length > 0 && <LockedVipCard title="Exclusive VIP 2" />}
                {predictions.exclusive_vip_3.length > 0 && <LockedVipCard title="Exclusive VIP 3" />}
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {renderCouponCard('exclusive_vip_1', 'Exclusive VIP 1', 'Your first VIP coupon.', <Ticket className="h-6 w-6 text-yellow-600"/>, predictions.exclusive_vip_1, true)}
                {renderCouponCard('exclusive_vip_2', 'Exclusive VIP 2', 'Your second VIP coupon.', <Ticket className="h-6 w-6 text-yellow-600"/>, predictions.exclusive_vip_2, true)}
                {renderCouponCard('exclusive_vip_3', 'Exclusive VIP 3', 'Your third VIP coupon.', <Ticket className="h-6 w-6 text-yellow-600"/>, predictions.exclusive_vip_3, true)}
            </div>
            
            {predictions.individual_vip.length > 0 && (
              <Card className="border-yellow-500/30 bg-yellow-400/5 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Star className="h-6 w-6 text-yellow-600"/>
                        VIP Individual List
                    </CardTitle>
                    <CardDescription>
                        Access the complete list of our individual VIP predictions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-1'>
                    {predictions.individual_vip.map(renderMatch)}
                  </div>
                </CardContent>
              </Card>
            )}
        </>
    );
};


export default function PredictionsPage() {
  const { user, loading: userLoading } = useUser();
  const { isVip, loading: vipLoading } = useVipStatus(user);
  const router = useRouter();
  const firestore = useFirestore();

  const [publishedCategories, setPublishedCategories] = useState<PredictionCategoryDoc[] | null>(null);
  const [predictionsLoading, setPredictionsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];
  const categoriesQuery = firestore 
    ? query(collection(firestore, `predictions/${today}/categories`), where("status", "==", "published"))
    : null;
    
  const { data, loading: collectionLoading, error } = useCollection<PredictionCategoryDoc>(categoriesQuery);

  useEffect(() => {
    setPublishedCategories(data);
    setPredictionsLoading(collectionLoading);
    if(error) console.error("Error fetching predictions:", error);
  }, [data, collectionLoading, error]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const isLoading = userLoading || vipLoading;

  const predictions = useMemo(() => {
    const structuredData: {
      secure_trial: MatchPrediction[];
      exclusive_vip_1: MatchPrediction[];
      exclusive_vip_2: MatchPrediction[];
      exclusive_vip_3: MatchPrediction[];
      individual_vip: MatchPrediction[];
      free_coupon: MatchPrediction[];
      free_individual: MatchPrediction[];
    } = {
        secure_trial: [], exclusive_vip_1: [], exclusive_vip_2: [], exclusive_vip_3: [],
        individual_vip: [], free_coupon: [], free_individual: [],
    };
    if (!publishedCategories) return structuredData;

    publishedCategories.forEach(cat => {
        if (cat.id === 'secure_trial') structuredData.secure_trial = cat.predictions;
        if (cat.id === 'free_coupon') structuredData.free_coupon = cat.predictions;
        if (cat.id === 'free_individual') structuredData.free_individual = cat.predictions;
        if (cat.id === 'exclusive_vip_1') structuredData.exclusive_vip_1 = cat.predictions;
        if (cat.id === 'exclusive_vip_2') structuredData.exclusive_vip_2 = cat.predictions;
        if (cat.id === 'exclusive_vip_3') structuredData.exclusive_vip_3 = cat.predictions;
        if (cat.id === 'individual_vip') structuredData.individual_vip = cat.predictions;
    });
    return structuredData;
  }, [publishedCategories]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const noPredictionsAvailable = !publishedCategories || publishedCategories.length === 0;

  const hasPaidPredictions = 
    predictions.exclusive_vip_1.length > 0 ||
    predictions.exclusive_vip_2.length > 0 ||
    predictions.exclusive_vip_3.length > 0 ||
    predictions.individual_vip.length > 0;

  const hasFreePredictions = 
    predictions.secure_trial.length > 0 ||
    predictions.free_coupon.length > 0 ||
    predictions.free_individual.length > 0;


  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="text-center">
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Prediction Categories
        </h2>
        <p className="text-muted-foreground">
          Choose a category to see the available predictions for today.
        </p>
      </div>

       {noPredictionsAvailable && !predictionsLoading && (
        <Card className='text-center p-12'>
            <p className='text-muted-foreground'>No predictions available for today. Check back later.</p>
        </Card>
      )}


      {!predictionsLoading && !noPredictionsAvailable && (
        <>
            {/* Free Section */}
            {hasFreePredictions && (
              <section className="space-y-4">
                <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2">
                  Free Section
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {renderCouponCard('secure_trial', 'Secure Trial', 'Try our predictions risk-free with our secure offer.', <ShieldCheck className="h-6 w-6 text-primary" />, predictions.secure_trial)}
                  {renderCouponCard('free_coupon', 'Free Coupon', 'Access free coupons for special predictions.', <Ticket className="h-6 w-6 text-primary" />, predictions.free_coupon)}
                  
                  {predictions.free_individual.length > 0 && (
                     <Card className="hover/card:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col h-full">
                       <CardHeader>
                           <CardTitle className="flex items-center gap-3">
                               <List className="h-6 w-6 text-primary" />
                               <span>Free Individual List</span>
                           </CardTitle>
                         <CardDescription>
                           See our list of free individual matches for the day.
                         </CardDescription>
                       </CardHeader>
                       <CardContent className='flex-grow space-y-1'>
                         {predictions.free_individual.map(renderMatch)}
                       </CardContent>
                     </Card>
                  )}
                </div>
              </section>
            )}
            
            <Separator />

            {/* Paid Section */}
            {hasPaidPredictions && (
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2 text-yellow-500">
                            <Crown /> Paid Section
                        </h3>
                        <p className="text-muted-foreground max-w-2xl">
                            Unlock access to our VIP predictions for the best chance to win.
                        </p>
                    </div>
                    {!isVip && (
                      <Link href="/payments" passHref>
                          <Button className="bg-yellow-600 hover:bg-yellow-700 text-primary-foreground font-bold shrink-0">
                              Go VIP
                              <Crown className="ml-2 h-4 w-4" />
                          </Button>
                      </Link>
                    )}
                </div>
                <PaidSectionContent predictions={predictions} isVip={isVip} isLoading={predictionsLoading || vipLoading} />
              </section>
            )}
        </>
      )}
    </div>
  );
}
