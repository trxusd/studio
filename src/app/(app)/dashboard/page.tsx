import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Award, Crown, Futbol } from "lucide-react";
import Link from 'next/link';
import { MatchCard } from "@/components/match-card";
import { matches } from "@/lib/data";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions Won</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82.5%</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Predictions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">Available today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP Status</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Free Plan</div>
            <p className="text-xs text-muted-foreground">Upgrade for premium predictions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Today&apos;s Free Predictions</CardTitle>
            <CardDescription>
              Here are the top matches available for free today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {matches.slice(0, 3).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/predictions">View All Free Predictions <ArrowUpRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="lg:col-span-3 bg-gradient-to-br from-yellow-300/20 via-yellow-400/20 to-yellow-500/20 border-yellow-500/50">
           <CardHeader>
             <div className="flex items-center gap-2">
                <Crown className="text-yellow-600" />
                <CardTitle className="font-headline text-yellow-800">Unlock VIP Access</CardTitle>
             </div>
            <CardDescription className="text-yellow-700/80">
              Get exclusive access to our most accurate, AI-powered predictions and in-depth analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 text-sm text-yellow-900/80">
                <li>Premium match predictions with higher accuracy.</li>
                <li>In-depth statistical analysis and insights.</li>
                <li>Access to the exclusive VIP community chat.</li>
                <li>Real-time alerts and betting signals.</li>
            </ul>
            <div className="mt-6">
                <h4 className="font-semibold text-yellow-900">Your VIP Progress</h4>
                <Progress value={25} className="w-full mt-2 [&>div]:bg-yellow-600" />
                <p className="text-xs text-yellow-700/80 mt-1">You're one step away from joining the winners circle.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold shadow-lg">
                <Link href="/payments">
                    Go VIP Now
                    <Crown className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

       <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Futbol className="text-primary"/> All Matches
            </CardTitle>
            <CardDescription>
              Browse all upcoming matches and find your next winning bet.
            </CardDescription>
          </CardHeader>
           <CardContent>
            <p className="text-sm text-muted-foreground">
                View live scores, upcoming fixtures, and detailed statistics for leagues all around the world.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/matches">Go to Matches <ArrowUpRight className="ml-2 h-4 w-4"/></Link>
            </Button>
          </CardFooter>
        </Card>

    </div>
  );
}

    
