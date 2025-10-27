import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find(
    (img) => img.id === 'hero-background'
  );

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {heroImage && (
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
        <div className="mb-6 flex items-center gap-4">
          <AppLogo className="size-20 text-primary" />
          <h1 className="font-headline text-7xl font-bold tracking-tighter">
            FOOTBET-WIN
          </h1>
        </div>
        <p className="mb-10 max-w-2xl text-lg text-neutral-300">
          Your intelligent platform for precise football match predictions.
          Leverage the power of AI to make informed betting decisions.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Link href="/dashboard">Enter App</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="font-bold">
            <Link href="/login">Login / Sign Up</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
