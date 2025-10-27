import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Link from "next/link";

export default function FavoriteMatchesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <Star className="text-yellow-400" /> Favorite Matches
        </h2>
        <Button variant="outline" asChild>
          <Link href="/matches">Back to All Matches</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">You haven't added any matches to your favorites yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
