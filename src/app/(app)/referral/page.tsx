
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { Gift, Copy, UserPlus, Star, DollarSign, Award, Info, Loader2, Crown, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { collection, query, where } from 'firebase/firestore';
import Link from "next/link";

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
                // This logic might need adjustment based on exact plan names from payments page
                if (ref.referredUserPlan.includes('Month') && !ref.referredUserPlan.includes('3') && !ref.referredUserPlan.includes('6')) {
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


    const referralCode = user ? `FBW-${user.uid.substring(0, 8).toUpperCase()}` : '...';
    
    const copyToClipboard = () => {
        if (!user) return;
        navigator.clipboard.writeText(referralCode);
        toast({
            title: "Copied to clipboard!",
            description: `Your referral code ${referralCode} is ready to be shared.`,
        });
    };

    const referralTiers = [
        { id: 1, sourcePlan: "VIP 1 (1 Month)", reward: "Free VIP 2 Plan", icon: <UserPlus className="text-primary"/> },
        { id: 2, sourcePlan: "VIP 2 (3 Months)", reward: "Free VIP 3 Plan", icon: <Star className="text-primary"/> },
        { id: 3, sourcePlan: "VIP 3 (6 Months)", reward: "Free VIP 4 Plan", icon: <Award className="text-primary"/> },
        { id: 4, sourcePlan: "VIP 4 (1 Year)", reward: "Free VIP 5 Plan", icon: <Crown className="text-primary"/> },
        { id: 5, sourcePlan: "VIP 5 (Lifetime)", reward: "$300 USD Cash", icon: <DollarSign className="text-primary"/> },
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
            <div className="flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Gift className="text-primary" /> FOOTBETWIN Referral Program
                </h2>
                <Button variant="outline" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Code</CardTitle>
                    <CardDescription>Share this code with your friends. When they sign up, you'll start earning commissions.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <div className="flex-1 border-2 border-dashed border-primary/50 bg-muted rounded-lg p-4 text-center">
                        <span className="text-2xl font-bold font-mono tracking-widest">{referralCode}</span>
                    </div>
                    <Button onClick={copyToClipboard} size="lg">
                        <Copy className="mr-2 h-4 w-4" /> Copy
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>How does it work?</CardTitle>
                    <CardDescription>It's simple! Invite 10 friends to a VIP plan to get your reward. Each tier is a one-time reward.</CardDescription>
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
                                                Invite 10 users to <span className="text-primary">{tier.sourcePlan}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary">Get → {tier.reward}</p>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                                            <span className="text-xs font-bold">{progress}/10</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-2" />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                   )}
                </CardContent>
                 <CardFooter className="text-muted-foreground text-sm">
                    <p>If you already have a plan and you earn a commission, you can request a transfer.</p>
                </CardFooter>
            </Card>

            <Card className="border-amber-500/50 bg-amber-500/5">
                <CardHeader className="flex flex-row items-center gap-3">
                    <Info className="text-amber-600" />
                    <CardTitle className="text-amber-800">Important Note</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-700 space-y-2">
                    <p>📌 These referral commissions are only valid on a user's **first activation**. Renewals are not included.</p>
                    <p>📌 Terms and conditions apply.</p>
                </CardContent>
            </Card>
        </div>
    );
}
