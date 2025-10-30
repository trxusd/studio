
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore } from '@/firebase';
import { collection, query, getDocs, Timestamp, where, collectionGroup } from 'firebase/firestore';
import { subDays, startOfDay, endOfDay, format as formatDateFns } from 'date-fns';
import { Loader2, TrendingUp, TrendingDown, Percent, BarChart, XCircle } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatisticsChart } from '@/components/statistics-chart';

type Period = 'yesterday' | '7d' | '15d' | '30d';

type MatchResult = {
    status?: 'Win' | 'Loss' | 'Pending';
    [key: string]: any;
};

type PredictionDoc = {
    predictions: MatchResult[];
    generated_at: Timestamp; // Using Firestore Timestamp
};


type Stats = {
    wins: number;
    losses: number;
    total: number;
    accuracy: number;
};

type DailyStat = {
    date: string;
    wins: number;
    losses: number;
    accuracy: number;
};

const periodLabels: Record<Period, string> = {
    yesterday: 'Hier',
    '7d': '7 derniers jours',
    '15d': '15 derniers jours',
    '30d': '1 mois',
};

async function fetchPredictionStats(firestore: any, period: Period): Promise<Stats & { dailyData: DailyStat[] }> {
    const now = new Date();
    let daysToFetch = 1;
    switch (period) {
        case 'yesterday': daysToFetch = 2; break; // Fetch for yesterday and the day before
        case '7d': daysToFetch = 7; break;
        case '15d': daysToFetch = 15; break;
        case '30d': daysToFetch = 30; break;
    }
    
    // Set dates for the query range
    const endDate = endOfDay(subDays(now, 1)); // up to yesterday
    const startDate = startOfDay(subDays(endDate, daysToFetch -1));
    
    const categoriesColGroup = collectionGroup(firestore, 'categories');
    
    // Query for all categories within the date range
    const q = query(
        categoriesColGroup,
        where('generated_at', '>=', startDate),
        where('generated_at', '<=', endDate)
    );

    const querySnapshot = await getDocs(q);
    const predictionsByDate: Record<string, { wins: number, losses: number }> = {};

    querySnapshot.forEach(doc => {
        const data = doc.data() as PredictionDoc;
        if (data.generated_at) {
            const dateKey = formatDateFns(data.generated_at.toDate(), 'yyyy-MM-dd');

            if (data && Array.isArray(data.predictions)) {
                if (!predictionsByDate[dateKey]) {
                    predictionsByDate[dateKey] = { wins: 0, losses: 0 };
                }

                data.predictions.forEach(prediction => {
                    if (prediction.status === 'Win') {
                        predictionsByDate[dateKey].wins++;
                    } else if (prediction.status === 'Loss') {
                        predictionsByDate[dateKey].losses++;
                    }
                });
            }
        }
    });

    let totalWins = 0;
    let totalLosses = 0;

    const dailyData: DailyStat[] = Object.entries(predictionsByDate).map(([date, counts]) => {
        totalWins += counts.wins;
        totalLosses += counts.losses;
        const dailyTotal = counts.wins + counts.losses;
        return {
            date: formatDateFns(new Date(date), 'MMM dd'),
            wins: counts.wins,
            losses: counts.losses,
            accuracy: dailyTotal > 0 ? parseFloat(((counts.wins / dailyTotal) * 100).toFixed(1)) : 0,
        };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    const total = totalWins + totalLosses;
    const accuracy = total > 0 ? parseFloat(((totalWins / total) * 100).toFixed(1)) : 0;

    return { wins: totalWins, losses: totalLosses, total, accuracy, dailyData };
}


export default function StatisticsPage() {
    const firestore = useFirestore();
    const [stats, setStats] = React.useState<Stats | null>(null);
    const [dailyData, setDailyData] = React.useState<DailyStat[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [selectedPeriod, setSelectedPeriod] = React.useState<Period>('7d');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!firestore) return;

        async function loadStats() {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedStats = await fetchPredictionStats(firestore, selectedPeriod);
                if (fetchedStats.total < 3) {
                     setError("Pa gen ase done pou estatistik serye.");
                     setStats(null);
                     setDailyData([]);
                } else {
                    setStats(fetchedStats);
                    setDailyData(fetchedStats.dailyData);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
                setError("Impossible de charger les statistiques.");
                setStats(null);
                setDailyData([]);
            } finally {
                setIsLoading(false);
            }
        }

        loadStats();
    }, [firestore, selectedPeriod]);

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
                    <BarChart /> Statistiques
                </h2>
                <ToggleGroup type="single" value={selectedPeriod} onValueChange={(value) => { if (value) setSelectedPeriod(value as Period) }} disabled={isLoading}>
                    {Object.keys(periodLabels).map(p => (
                         <ToggleGroupItem key={p} value={p} aria-label={periodLabels[p as Period]}>
                            {periodLabels[p as Period]}
                         </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : error ? (
                <Card className="flex flex-col items-center justify-center h-96 text-center">
                    <XCircle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-xl font-semibold">Erè</h3>
                    <p className="text-muted-foreground">{error}</p>
                </Card>
            ) : stats && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Victoires (WIN)</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-500">{stats.wins}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pertes (LOSS)</CardTitle>
                                <TrendingDown className="h-4 w-4 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">{stats.losses}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                                <Percent className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{stats.accuracy}%</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                             <CardTitle>Evolution des Performances</CardTitle>
                             <CardDescription>
                                Résumé visuel des victoires, des pertes et du taux de réussite pour la période de {periodLabels[selectedPeriod]}.
                             </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StatisticsChart data={dailyData} />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
