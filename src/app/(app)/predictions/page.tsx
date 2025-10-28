
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ticket, ShieldCheck, List, Crown, Lock, Loader2, Star } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

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
      const isUserVip = true; // you can change this to false to see the locked state
      setIsVip(isUserVip);

    } else {
      setIsVip(false);
    }
    setLoading(false);
  }, [user]);

  return { isVip, loading: loading };
};

type MatchPrediction = {
  match: string;
  prediction: string;
  odds?: number;
  confidence?: number;
};

type PredictionCategoryDoc = {
    id: string;
    predictions: MatchPrediction[];
    status: 'published' | 'unpublished';
    category: string;
};


export default function PredictionsPage() {
  const { user, loading: userLoading } = useUser();
  const { isVip, loading: vipLoading } = useVipStatus(user);
  const router = useRouter();
  const firestore = useFirestore();

  const today = new Date().toISOString().split('T')[0];
  const categoriesQuery = firestore 
    ? query(collection(firestore, `predictions/${today}`), where("status", "==", "published"))
    : null;
    
  const { data: publishedCategories, loading: predictionsLoading } = useCollection<PredictionCategoryDoc>(categoriesQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const isLoading = userLoading || vipLoading || predictionsLoading;

  const predictions = useMemo(() => {
    if (!publishedCategories) return null;

    const structuredData = {
        secure_trial: { coupon_1: [] as MatchPrediction[] },
        exclusive_vip: { coupon_1: [] as MatchPrediction[], coupon_2: [] as MatchPrediction[], coupon_3: [] as MatchPrediction[] },
        individual_vip: [] as MatchPrediction[],
        free_coupon: { coupon_1: [] as MatchPrediction[] },
        free_individual: [] as MatchPrediction[],
    };

    publishedCategories.forEach(cat => {
        if (cat.id === 'secure_trial') structuredData.secure_trial.coupon_1 = cat.predictions;
        if (cat.id === 'free_coupon') structuredData.free_coupon.coupon_1 = cat.predictions;
        if (cat.id === 'free_individual') structuredData.free_individual = cat.predictions;
        if (cat.id === 'exclusive_vip_1') structuredData.exclusive_vip.coupon_1 = cat.predictions;
        if (cat.id === 'exclusive_vip_2') structuredData.exclusive_vip.coupon_2 = cat.predictions;
        if (cat.id === 'exclusive_vip_3') structuredData.exclusive_vip.coupon_3 = cat.predictions;
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
  
  const renderMatch = (match: MatchPrediction, index: number) => (
    <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50">
        <span>{match.match}</span>
        <Badge variant="secondary">{match.prediction}</Badge>
    </div>
  );

  const renderLocked = () => (
    <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
        <Lock className="h-6 w-6 mb-2"/>
        <p className="text-sm">This section is for VIP members only.</p>
        <Button asChild variant="link" className="text-primary h-auto p-0 mt-1">
            <Link href="/payments">Go VIP</Link>
        </Button>
    </div>
  )

  const noPredictionsAvailable = !predictions || (
      !predictions.secure_trial.coupon_1.length &&
      !predictions.free_coupon.coupon_1.length &&
      !predictions.free_individual.length &&
      !predictions.exclusive_vip.coupon_1.length &&
      !predictions.individual_vip.length
  );


  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Kategori Prédictions
        </h2>
        <p className="text-muted-foreground">
          Chwazi yon kategori pou wè prediksyon ki disponib yo pou jodi a.
        </p>
      </div>

       {noPredictionsAvailable && !isLoading && (
        <Card className='text-center p-12'>
            <p className='text-muted-foreground'>Pa gen prediksyon ki disponib pou jodi a. Tounen pita.</p>
        </Card>
      )}


      {predictions && !noPredictionsAvailable && (
        <>
            {/* Free Section */}
            {(predictions.secure_trial.coupon_1.length > 0 || predictions.free_coupon.coupon_1.length > 0 || predictions.free_individual.length > 0) && (
              <section className="space-y-4">
                <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2">
                  Seksyon Gratis
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {predictions.secure_trial.coupon_1.length > 0 && (
                    <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                              <ShieldCheck className="h-6 w-6 text-primary" />
                              <span>Trial Secure</span>
                          </CardTitle>
                        <CardDescription>
                          Eseye prediksyon nou yo san risk ak òf sekirize nou an.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex-grow'>
                        {predictions.secure_trial.coupon_1.map(renderMatch)}
                      </CardContent>
                    </Card>
                  )}
                  {predictions.free_coupon.coupon_1.length > 0 && (
                    <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3">
                              <Ticket className="h-6 w-6 text-primary" />
                              <span>Free Coupon</span>
                          </CardTitle>
                        <CardDescription>
                          Aksede a koupon gratis pou prediksyon espesyal.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex-grow'>
                        {predictions.free_coupon.coupon_1.map(renderMatch)}
                      </CardContent>
                    </Card>
                  )}
                  {predictions.free_individual.length > 0 && (
                    <Card className="hover/card:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-3">
                                  <List className="h-6 w-6 text-primary" />
                                  <span>Free List Individual</span>
                              </CardTitle>
                              <Link href="/matches" passHref>
                                  <Button variant="ghost" size="icon">
                                      <ArrowRight className="h-4 w-4" />
                                  </Button>
                              </Link>
                          </div>
                        <CardDescription>
                          Gade lis match endividyèl gratis nou yo pou jounen an.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className='flex-grow space-y-1'>
                        {predictions.free_individual.slice(0, 5).map(renderMatch)}
                        {predictions.free_individual.length > 5 && <p className='text-center text-sm text-muted-foreground pt-2'>... and {predictions.free_individual.length - 5} more.</p>}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>
            )}
            
            <Separator />

            {/* Paid Section */}
            {(predictions.exclusive_vip.coupon_1.length > 0 || predictions.individual_vip.length > 0) && (
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                        <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2 text-yellow-500">
                            <Crown /> Seksyon Peyan
                        </h3>
                        <p className="text-muted-foreground max-w-2xl">
                            Debloke aksè a prediksyon VIP nou yo pou pi bon chans genyen.
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

                {predictions.exclusive_vip.coupon_1.length > 0 && (
                  <Card className="border-yellow-500/30 bg-yellow-400/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Ticket className="h-6 w-6 text-yellow-600"/>
                            Exclusive VIP Predictions: Coupons
                        </CardTitle>
                        <CardDescription>
                            Sèvi ak koupon VIP ou yo pou debloke prediksyon prim sa yo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                        {isVip ? (
                          <>
                              <div>
                                  <h4 className="font-semibold mb-2">Coupon 1</h4>
                                  {predictions.exclusive_vip.coupon_1.map(renderMatch)}
                              </div>
                              <div>
                                  <h4 className="font-semibold mb-2">Coupon 2</h4>
                                  {predictions.exclusive_vip.coupon_2.map(renderMatch)}
                              </div>
                              <div>
                                  <h4 className="font-semibold mb-2">Coupon 3</h4>
                                  {predictions.exclusive_vip.coupon_3.map(renderMatch)}
                              </div>
                          </>
                        ) : renderLocked()}
                    </CardContent>
                  </Card>
                )}

                {predictions.individual_vip.length > 0 && (
                  <Card className="border-yellow-500/30 bg-yellow-400/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-3">
                                <Star className="h-6 w-6 text-yellow-600"/>
                                VIP List Individual
                            </CardTitle>
                            <Link href="/vip-predictions" passHref>
                                <Button variant="ghost" size="icon">
                                    <ArrowRight className="h-4 w-4 text-yellow-600" />
                                </Button>
                            </Link>
                        </div>
                        <CardDescription>
                            Aksede a lis konplè prediksyon VIP endividyèl nou yo.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isVip ? (
                          <div className='space-y-1'>
                            {predictions.individual_vip.slice(0, 5).map(renderMatch)}
                              {predictions.individual_vip.length > 5 && <p className='text-center text-sm text-muted-foreground pt-2'>... and {predictions.individual_vip.length - 5} more in the VIP section.</p>}
                          </div>
                        ) : renderLocked()}
                    </CardContent>
                  </Card>
                )}
              </section>
            )}
        </>
      )}
    </div>
  );
}
