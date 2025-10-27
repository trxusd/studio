import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Radio } from "lucide-react";
import Link from "next/link";

export default function LiveMatchesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
          <Radio className="text-red-500" /> Live Matches
        </h2>
        <Button variant="outline" asChild>
          <Link href="/matches">Back to All Matches</Link>
        </Button>
      </div>
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No live matches currently in progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
