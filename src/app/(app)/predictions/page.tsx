import { MatchCard } from "@/components/match-card";
import { matches } from "@/lib/data";

export default function PredictionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Free Predictions</h2>
      <p className="text-muted-foreground">
        Browse all available free match predictions. For more, consider upgrading to VIP.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
