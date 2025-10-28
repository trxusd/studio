
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { DollarSign, Users, BarChart, Activity, Bot, Trophy, CheckCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';

// Define the types for our documents
type UserProfile = {
    id: string;
    isVip?: boolean;
};

type PaymentVerification = {
    id: string;
    status: 'Approved' | 'Pending' | 'Rejected';
    amount: number;
};

type PredictionCategory = {
    id: string;
    predictions: any[];
};

export default function AdminDashboardPage() {
    const firestore = useFirestore();
    const today = new Date().toISOString().split('T')[0];

    // Queries for our data
    const usersQuery = firestore ? query(collection(firestore, 'users')) : null;
    const paymentsQuery = firestore ? query(collection(firestore, 'paymentVerifications'), where('status', '==', 'Approved')) : null;
    const predictionsQuery = firestore ? query(collection(firestore, `predictions/${today}/categories`), where('status', '==', 'published')) : null;
    
    // Fetch collections
    const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);
    const { data: approvedPayments, loading: paymentsLoading } = useCollection<PaymentVerification>(paymentsQuery);
    const { data: publishedPredictions, loading: predictionsLoading } = useCollection<PredictionCategory>(predictionsQuery);

    // Calculate stats with useMemo for performance
    const stats = useMemo(() => {
        const totalUsers = users ? users.length : 0;
        const vipUsers = users ? users.filter(u => u.isVip).length : 0;
        const totalRevenue = approvedPayments ? approvedPayments.reduce((sum, p) => sum + p.amount, 0) : 0;
        const activePredictions = publishedPredictions ? publishedPredictions.reduce((sum, cat) => sum + cat.predictions.length, 0) : 0;

        return {
            totalUsers,
            vipUsers,
            totalRevenue,
            activePredictions
        };
    }, [users, approvedPayments, publishedPredictions]);

    const isLoading = usersLoading || paymentsLoading || predictionsLoading;

    if (isLoading) {
        return (
             <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of the platform's activity.</p>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on all approved payments.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            VIP Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.vipUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently active VIP members.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registered users.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePredictions}</div>
                        <p className="text-xs text-muted-foreground">
                            Total predictions published today.
                        </p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
                <h2 className="text-xl font-semibold tracking-tight font-headline mb-4">Management Tools</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bot /> Official Predictions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Manually trigger the daily AI prediction generation process.</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/official-predictions">Go to predictions <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CheckCheck /> Payment Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Review and approve or reject user payment submissions.</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/payment-verification">Review payments <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy /> Check Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Automatically check prediction outcomes against final scores.</CardDescription>
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/admin/check-results">View results <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

             <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A log of recent platform events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Activity feed will be displayed here.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
