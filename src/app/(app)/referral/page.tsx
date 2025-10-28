
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Gift, Copy, UserPlus, Star, DollarSign, Award, Info, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { collection, query, where } from 'firebase/firestore';

type Referral = {
    id: string;
    referredUserPlan: string;
    timestamp: any;
};

export default function ReferralPage() {
    const { user, loading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const referralsQuery = firestore && user ? query(collection(firestore, `users/${user.uid}/referrals`)) : null;
    const { data: referrals, loading: referralsLoading } = useCollection<Referral>(referralsQuery);
    
    const referralProgress = useMemo(() => {
        const progress = {
            'VIP 1 (1 Month)': 0,
            'VIP 2 (3 Months)': 0,
            'VIP 3 (6 Months)': 0,
            'VIP 4 (1 Year)': 0,
            'VIP 5 (Lifetime)': 0,
        };
        if (referrals) {
            referrals.forEach(ref => {
                // This logic might need adjustment based on exact plan names
                if (ref.referredUserPlan.includes('Month')) {
                    progress['VIP 1 (1 Month)']++;
                }
                if (ref.referredUserPlan.includes('3 Months')) {
                    progress['VIP 2 (3 Months)']++;
                }
                 if (ref.referredUserPlan.includes('6 Months')) {
                    progress['VIP 3 (6 Months)']++;
                }
                if (ref.referredUserPlan.includes('1 Year')) {
                    progress['VIP 4 (1 Year)']++;
                }
                if (ref.referredUserPlan.includes('Lifetime')) {
                    progress['VIP 5 (Lifetime)']++;
                }
            });
        }
        return progress;
    }, [referrals]);


    const referralCode = user ? `FWIN-${user.uid.substring(0, 8).toUpperCase()}` : '...';
    
    const copyToClipboard = () => {
        if (!user) return;
        navigator.clipboard.writeText(referralCode);
        toast({
            title: "Copied to clipboard!",
            description: `Your referral code ${referralCode} is ready to be shared.`,
        });
    };

    const referralTiers = [
        { id: 1, sourcePlan: "VIP 1 (1 Month)", reward: "Plan VIP 2 Gratis", icon: <UserPlus className="text-primary"/> },
        { id: 2, sourcePlan: "VIP 2 (3 Months)", reward: "Plan VIP 3 Gratis", icon: <Star className="text-primary"/> },
        { id: 3, sourcePlan: "VIP 3 (6 Months)", reward: "Plan VIP 4 Gratis", icon: <Award className="text-primary"/> },
        { id: 4, sourcePlan: "VIP 4 (1 Year)", reward: "Plan VIP 5 Gratis", icon: <Crown className="text-primary"/> },
        { id: 5, sourcePlan: "VIP 5 (Lifetime)", reward: "$300 USD Kach", icon: <DollarSign className="text-primary"/> },
    ];

    if (loading || !user) {
         return (
            <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-3">
                <Gift className="text-primary" /> Pwogram Parenaj FOOTBETWIN
            </h2>
            
            <Card>
                <CardHeader>
                    <CardTitle>Kòd Parenaj Ou</CardTitle>
                    <CardDescription>Pataje kòd sa a ak zanmi w yo pou yo ka enskri epi pou w kòmanse touche komisyon.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="flex-1 border-2 border-dashed border-primary/50 bg-muted rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold font-mono tracking-widest">{referralCode}</span>
                    </div>
                    <Button onClick={copyToClipboard} size="lg">
                        <Copy className="mr-2 h-4 w-4" /> Kopye
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ki jan sa mache?</CardTitle>
                    <CardDescription>Se senp! Envites 10 zanmi nan yon plan VIP pou w ka jwenn rekonpans ou. Chak nivo se yon sèl fwa.</CardDescription>
                </CardHeader>
                <CardContent>
                   {referralsLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                   ): (
                     <ul className="space-y-4">
                        {referralTiers.map(tier => {
                            const progress = referralProgress[tier.sourcePlan as keyof typeof referralProgress] || 0;
                            const progressPercentage = (progress / 10) * 100;
                            return (
                                <li key={tier.id} className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-primary/10 rounded-full">{tier.icon}</div>
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                Envite 10 itilizatè nan <span className="text-primary">{tier.sourcePlan}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">Jwenn → {tier.reward}</p>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-muted-foreground">Pwogrè</span>
                                            <span className="text-xs font-bold">{progress}/10</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </div>
                                li key={tier.id}
                            );
                        })}
                    </ul>
                   )}
                </CardContent>
                 <CardFooter className="text-muted-foreground text-sm">
                    <p>Siw deja gen yon plan epi ou rive gen komisyon an ou ka mande li nap transfere ou li.</p>
                </CardFooter>
            </Card>

            <Card className="border-amber-500/50 bg-amber-500/5">
                <CardHeader className="flex flex-row items-center gap-3">
                    <Info className="text-amber-600" />
                    <CardTitle className="text-amber-800">Nòt enpòtan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-700 space-y-2">
                    <p>📌 Komisyon parenaj sa yo valab sèlman sou **premye aktivasyon** yon itilizatè. Renouvelman pa antre ladan l.</p>
                    <p>📌 Tèm ak kondisyon aplikab.</p>
                </CardContent>
            </Card>
        </div>
    );
}

    