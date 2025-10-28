
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { MatchPrediction } from '@/ai/schemas/prediction-schemas';
import { ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { format } from 'date-fns';

type MatchCardProps = {
  match: MatchPrediction;
  isVip?: boolean;
};

export function MatchCard({ match, isVip = false }: MatchCardProps) {
    
    const matchDate = new Date(match.time);
    const formattedDate = format(matchDate, 'MMM dd, yyyy');
    const formattedTime = format(matchDate, 'HH:mm');

  return (
    <Card className={cn("flex flex-col", isVip && "border-yellow-500 bg-yellow-500/10")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
            <CardDescription>{match.league}</CardDescription>
            {isVip && <Crown className="h-4 w-4 text-yellow-500" />}
        </div>
        <CardTitle className="text-sm font-medium pt-2">
          {formattedDate} - {formattedTime}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{match.match}</span>
          </div>
          <div className='flex items-center justify-between'>
            <Badge variant="secondary">{match.prediction}</Badge>
            {match.odds && match.odds > 1 && <span className='font-bold text-lg'>{match.odds}</span>}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/predictions/${match.fixture_id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
