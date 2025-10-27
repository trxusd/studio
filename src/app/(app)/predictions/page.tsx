import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ticket, ShieldCheck, List, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function PredictionsPage() {
  return (
    <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
      <div>
        <h2 className="font-headline text-3xl font-bold tracking-tight">
          Kategori Prédictions
        </h2>
        <p className="text-muted-foreground">
          Chwazi yon kategori pou wè prediksyon ki disponib yo.
        </p>
      </div>

      {/* Free Section */}
      <section className="space-y-4">
        <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2">
           Seksyon Gratis
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span>Trial Secure</span>
                    </CardTitle>
                    <Link href="#" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
              <CardDescription>
                Eseye prediksyon nou yo san risk ak òf sekirize nou an.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <CardHeader>
               <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <Ticket className="h-6 w-6 text-primary" />
                        <span>Free Coupon</span>
                    </CardTitle>
                    <Link href="#" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
              <CardDescription>
                Aksede a koupon gratis pou prediksyon espesyal.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover/card:border-primary/50 hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <List className="h-6 w-6 text-primary" />
                        <span>Free List Individual</span>
                    </CardTitle>
                    <Link href="/matches" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
              <CardDescription>
                Gade lis match endividyèl gratis nou yo pou jounen an.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
      
      <Separator />

      {/* Paid Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
                <h3 className="font-headline text-2xl font-semibold tracking-tight flex items-center gap-2 text-yellow-500">
                    <Crown /> Seksyon Peyan
                </h3>
                <p className="text-muted-foreground max-w-2xl">
                    Debloke aksè a prediksyon VIP nou yo pou pi bon chans genyen.
                </p>
            </div>
            <Link href="/payments" passHref>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-primary-foreground font-bold shrink-0">
                    Go VIP
                    <Crown className="ml-2 h-4 w-4" />
                </Button>
            </Link>
        </div>

        <Card className="border-yellow-500/30 bg-yellow-400/5">
            <CardHeader>
                 <CardTitle className="flex items-center gap-3">
                    <Ticket className="h-6 w-6 text-yellow-600"/>
                    Exclusive VIP Predictions: Coupons
                </CardTitle>
                 <CardDescription>
                    Sèvi ak koupon VIP ou yo pou debloke prediksyon prim sa yo.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
                <Link href="#" className="group">
                    <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-yellow-500/80 hover:bg-yellow-500/10 transition-colors">
                        <div className="flex items-center justify-center text-muted-foreground group-hover:text-yellow-600">
                            <Lock className="h-5 w-5 mr-2"/>
                            <span className="font-bold">Coupon 1</span>
                        </div>
                    </div>
                </Link>
                <Link href="#" className="group">
                    <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-yellow-500/80 hover:bg-yellow-500/10 transition-colors">
                        <div className="flex items-center justify-center text-muted-foreground group-hover:text-yellow-600">
                            <Lock className="h-5 w-5 mr-2"/>
                            <span className="font-bold">Coupon 2</span>
                        </div>
                    </div>
                </Link>
                 <Link href="#" className="group">
                    <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-yellow-500/80 hover:bg-yellow-500/10 transition-colors">
                        <div className="flex items-center justify-center text-muted-foreground group-hover:text-yellow-600">
                            <Lock className="h-5 w-5 mr-2"/>
                            <span className="font-bold">Coupon 3</span>
                        </div>
                    </div>
                </Link>
            </CardContent>
        </Card>
         <Card className="border-yellow-500/30 bg-yellow-400/5">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                        <List className="h-6 w-6 text-yellow-600"/>
                        VIP List Individual
                    </CardTitle>
                    <Link href="/vip-predictions" passHref>
                        <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4 text-yellow-600" />
                        </Button>
                    </Link>
                </div>
                 <CardDescription>
                    Aksede a lis konplè prediksyon VIP endividyèl nou yo.
                </CardDescription>
            </CardHeader>
        </Card>
      </section>
    </div>
  );
}
