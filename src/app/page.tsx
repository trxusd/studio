import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
        <AppLogo className="mb-6 size-24" />
        <h1 className="max-w-2xl text-5xl font-bold tracking-tighter text-foreground md:text-6xl">
          AI-Powered <span className="text-primary">Football Predictions</span>
        </h1>
        <p className="my-6 max-w-lg text-lg text-muted-foreground">
          Leverage the power of AI to make smarter bets. Access exclusive
          coupons, expert predictions, and 24/7 support.
        </p>
        <Button asChild size="lg" className="font-bold">
          <Link href="/dashboard">
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
