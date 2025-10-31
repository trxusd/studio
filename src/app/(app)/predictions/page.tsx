
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
import { collection, query, where, doc, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { type MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { differenceInDays } from 'date-fns';


type UserProfile = {
  isVip?: boolean;
  createdAt?: Timestamp;
};

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
};


// Custom hook to fetch user profile data including VIP status and creation date
const useUserProfile = (user: any) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  const userQuery = useMemo(() => (firestore && user ? query(collection(firestore, 'users'), where('uid', '==', user.uid)) : null), [firestore, user]);
  const { data: userData, loading: userDataLoading } = useCollection<UserProfile>(userQuery);

  useEffect(() => {
    if (!userDataLoading) {
      setProfile(userData?.[0] || null);
      setLoading(false);
    }
  }, [userData, userDataLoading]);

  return { profile, loading };
};


const renderMatchVip = (match: MatchPrediction, index: number) => {
  if (!match) return null;
  return (
    <div key={index} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-black/10">
      <div className="flex-1 truncate pr-2">
        <p className="font-medium truncate">{match.match}</p>
        <p className="text-black/70">{match.prediction}</p>
      </div>
      <Badge variant="secondary" className="font-bold bg-black/10 text-black">{match.odds?.toFixed(2)}</Badge>
    </div>
  );
};

const renderMatchFree = (match: MatchPrediction, index: number) => {
  if (!match) return null;
  return (
    <div key={index} className="flex items-center justify-between text-xs p-2 rounded-md hover:bg-muted/50">
      <div className="flex-1 truncate pr-2">
        <p className="font-medium truncate">{match.match}</p>
        <p className="text-muted-foreground">{match.prediction}</p>
      </div>
      <Badge variant="outline" className="font-bold border-primary text-primary">{match.odds?.toFixed(2)}</Badge>
    </div>
  );
};

const renderCouponCard = (id: string, title: string, description: string, icon: React.ReactNode, matches: MatchPrediction[], isVipCard = false) => {
    if (!matches || matches.length === 0) return null;
    
    const cardClasses = isVipCard 
        ? 'bg-yellow-500 text-black border-yellow-600' 
        : 'hover:border-primary/50 hover:bg-muted/50';

    const descriptionClasses = isVipCard ? 'text-black/80' : '';
    const matchRenderer = isVipCard ? renderMatchVip : renderMatchFree;

    return (
        <Link href={`/predictions/coupon/${id}`} passHref className="h-full block">
            <Card className={`transition-colors flex flex-col h-full cursor-pointer ${cardClasses}`}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        {icon}
                        <span>{title}</span>
                    </CardTitle>
                    <CardDescription className={descriptionClasses}>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-1">
                    {matches.map(matchRenderer)}
                </CardContent>
            </Card>
        </Link>
    );
}

const PaidSectionContent = ({ predictions, isVip, canAccessVip }: { predictions: any, isVip: boolean, canAccessVip: boolean }) => {
    if (!canAccessVip) {
        return (
             <Card className="mt-8 border-yellow-500/50 bg-gradient-to-br from-yellow-300/20 to-transparent">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <div className="rounded-full bg-yellow-500/20 p-4">
                        <Lock className="h-12 w-12 text-yellow-600"/>
                    </div>
                    <h3 className="font-headline text-2xl font-bold text-yellow-800">This Content is Locked</h3>
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
        )
    }

    const hasPaidPredictions =
        predictions.exclusive_vip_1.length > 0 ||
        predictions.exclusive_vip_2.length > 0 ||
        predictions.exclusive_vip_3.length > 0 ||
        predictions.individual_vip.length > 0;
    
    if (!hasPaidPredictions) {
        return (
             <Card className="border-yellow-500/30 bg-yellow-400/5 mt-6">
                <CardContent className="p-12 text-center text-muted-foreground">
                   No VIP predictions available for today. Please check back later.
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {renderCouponCard('exclusive_vip_1', 'Exclusive VIP 1', 'Your first VIP coupon.', <Ticket className="h-6 w-6"/>, predictions.exclusive_vip_1, true)}
                {renderCouponCard('exclusive_vip_2', 'Exclusive VIP 2', 'Your second VIP coupon.', <Ticket className="h-6 w-6"/>, predictions.exclusive_vip_2, true)}
                {renderCouponCard('exclusive_vip_3', 'Exclusive VIP 3', 'Your third VIP coupon.', <Ticket className="h-6 w-6"/>, predictions.exclusive_vip_3, true)}
            </div>
            
            {predictions.individual_vip.length > 0 && (
              <Card className="bg-yellow-500 text-black border-yellow-600 mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Star className="h-6 w-6"/>
                        VIP Individual List
                    </CardTitle>
                    <CardDescription className='text-black/80'>
                        Access the complete list of our individual VIP predictions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-1'>
                    {predictions.individual_vip.map(renderMatchVip)}
                  </div>
                </CardContent>
              </Card>
            )}
        </>
    );
};


export default function PredictionsPage() {
  const { user, loading: userLoading } = useUser();
  const { profile, loading: profileLoading } = useUserProfile(user);
  const router = useRouter();
  const firestore = useFirestore();

  const [canAccessSecureTrial, setCanAccessSecureTrial] = useState(false);
  const [today, setToday] = useState('');
  
  useEffect(() => {
    // This effect runs only on the client, after hydration.
    setToday(new Date().toISOString().split('T')[0]);
  }, []);
  
  useEffect(() => {
    if (user && user.metadata.creationTime) {
      const accountAgeInDays = differenceInDays(new Date(), new Date(user.metadata.creationTime));
      const adminEmails = ['trxusdt87@gmail.com', 'footbetwin2025@gmail.com'];
      const isUserAdmin = user?.email ? adminEmails.includes(user.email) : false;
      const isVip = profile?.isVip || false;
      
      setCanAccessSecureTrial(isUserAdmin || isVip || accountAgeInDays < 10);
    }
  }, [user, profile]);

  const categoriesQuery = useMemo(() => (firestore && today
    ? query(collection(firestore, `predictions/${today}/categories`), where("status", "==", "published"))
    : null), [firestore, today]);
    
  const { data: publishedCategories, loading: predictionsLoading } = useCollection<PredictionCategoryDoc>(categoriesQuery);

  const adminEmails = ['trxusdt87@gmail.com', 'footbetwin2025@gmail.com'];
  const isUserAdmin = user?.email ? adminEmails.includes(user.email) : false;
  
  const isVip = profile?.isVip || false;
  const canAccessVip = isUserAdmin || isVip;

  const isLoading = userLoading || profileLoading || predictionsLoading || !today;

  const predictions = useMemo(() => {
    const structuredData = {
        secure_trial: [], exclusive_vip_1: [], exclusive_vip_2: [], exclusive_vip_3: [],
        individual_vip: [], free_coupon: [], free_individual: [], fbw_special: [],
    } as Record<string, MatchPrediction[]>;

    if (!publishedCategories) return structuredData;

    publishedCategories.forEach(cat => {
        if (structuredData[cat.id] !== undefined) {
            structuredData[cat.id] = cat.predictions;
        }
    });
    return structuredData;
  }, [publishedCategories]);

  
  const noPredictionsAvailable = !isLoading && (!publishedCategories || publishedCategories.length === 0);

  const hasFreePredictions = 
    !isLoading && (
        (canAccessSecureTrial && predictions.secure_trial.length > 0) ||
        predictions.free_coupon.length > 0 ||
        predictions.free_individual.length > 0
    );


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

       {isLoading && (
         <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
       )}

       {noPredictionsAvailable && (
        <Card className='text-center p-12'>
            <p className='text-muted-foreground'>No predictions available for today. Check back later.</p>
        </Card>
      )}


      {!isLoading && !noPredictionsAvailable && (
        <div className="space-y-8">
            {/* FBW Special Section */}
            {canAccessVip && predictions.fbw_special.length > 0 && (
                <section>
                    <Card className="mt-8 border-blue-500/50 bg-gradient-to-br from-blue-400/20 to-transparent">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-blue-300"><Star className="text-blue-400 fill-blue-400" /> FBW Special</CardTitle>
                            <CardDescription className="text-blue-300/80">
                                Our most elite, highly-confident predictions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-1">
                             {predictions.fbw_special.map((match, index) => (
                                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-blue-400/10">
                                  <div className="flex-1 truncate pr-2">
                                    <p className="font-medium truncate">{match.match}</p>
                                    <p className="text-blue-300/70">{match.prediction}</p>
                                  </div>
                                  <Badge variant="outline" className="font-bold border-blue-400 text-blue-300 bg-blue-900/50">{match.odds?.toFixed(2)}</Badge>
                                </div>
                              ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* Free and Paid Sections Wrapper */}
            <section className="space-y-8">
                {(hasFreePredictions && (predictions.free_individual.length > 0 || predictions.free_coupon.length > 0 || (canAccessSecureTrial && predictions.secure_trial.length > 0))) && (
                  <div className="space-y-4">
                    <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2">
                      Free Section
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {canAccessSecureTrial && renderCouponCard('secure_trial', 'Secure Trial', 'Try our predictions risk-free with our secure offer.', <ShieldCheck className="h-6 w-6 text-primary" />, predictions.secure_trial)}
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
                             {predictions.free_individual.map(renderMatchFree)}
                           </CardContent>
                         </Card>
                      )}
                    </div>
                  </div>
                )}
                
                <Separator />

                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                            <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2 text-yellow-500">
                                <Crown /> Subscription Section
                            </h3>
                            <p className="text-muted-foreground max-w-2xl">
                                Unlock access to our Subscription predictions for the best chance to win.
                            </p>
                        </div>
                    </div>
                    <PaidSectionContent predictions={predictions} isVip={isVip} canAccessVip={canAccessVip} />
                  </div>
            </section>
        </div>
      )}
    </div>
  );
}
