import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PredictionsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Redirecting...</h2>
      <p className="text-muted-foreground mt-2">
        This page has been moved. You are being redirected to the new Matches page.
      </p>
      <Button asChild className="mt-6">
        <Link href="/matches">Go to Matches</Link>
      </Button>
    </div>
  );
}
