
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { DollarSign, Users, BarChart, Activity, Bot, Trophy, CheckCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
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
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% from last month
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
                        <div className="text-2xl font-bold">+2350</div>
                        <p className="text-xs text-muted-foreground">
                            +180.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12,234</div>
                        <p className="text-xs text-muted-foreground">
                            +19% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">
                            +201 since last hour
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
