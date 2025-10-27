import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Match } from '@/lib/data';
import { ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

type MatchCardProps = {
  match: Match;
  isVip?: boolean;
};

export function MatchCard({ match, isVip = false }: MatchCardProps) {
  const winProb = match.prediction ? Math.round(match.prediction.teamAWinProbability * 100) : 50;
  const loseProb = match.prediction ? Math.round(match.prediction.teamBWinProbability * 100) : 30;
  const drawProb = 100 - winProb - loseProb;

  return (
    <Card className={cn("flex flex-col", isVip && "border-yellow-500 bg-yellow-500/10")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardDescription>{match.league}</CardDescription>
            {isVip && <Crown className="h-4 w-4 text-yellow-500" />}
        </div>
        <CardTitle className="text-sm font-medium pt-2">
          {new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          {' - '}
          {new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center gap-2">
            <Image src={match.teamA.logo} alt={match.teamA.name} width={24} height={24} className="rounded-full" data-ai-hint="sports logo" />
            <span className="font-semibold">{match.teamA.name}</span>
          </div>
          <Badge variant="secondary">{winProb}%</Badge>
        </div>
        <div className="my-2 flex items-center justify-center text-xs font-bold text-muted-foreground">VS</div>
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center gap-2">
            <Image src={match.teamB.logo} alt={match.teamB.name} width={24} height={24} className="rounded-full" data-ai-hint="sports logo" />
            <span className="font-semibold">{match.teamB.name}</span>
          </div>
          <Badge variant="secondary">{loseProb}%</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/predictions/${match.id}`}>
            View Prediction <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
