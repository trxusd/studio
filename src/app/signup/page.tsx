
'use client';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SignUpPage() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+509');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralId, setReferralId] = useState(referralCode || '');


  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async () => {
    if (!auth || !firestore) {
      setError("Authentication service not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
        if (!fullName || !email || !password || !phone) {
            setError("Please fill in all fields.");
            setIsLoading(false);
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: fullName });
        
        let referredBy = null;
        if (referralId && referralId.startsWith('FBW-')) {
            const uidPart = referralId.substring(4);
            if(uidPart) {
                referredBy = uidPart;
            }
        }

        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            displayName: fullName,
            email: user.email,
            phone: `${countryCode}${phone}`,
            createdAt: serverTimestamp(),
            isVip: false,
            referredBy: referredBy,
        });

        toast({ title: "Account created successfully!" });
        router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = "An unknown error occurred.";
      switch (err.code) {
        case 'auth/email-already-in-use':
          friendlyMessage = "This email is already in use. Please sign in.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "The password is too weak. It must be at least 6 characters long.";
          break;
        case 'auth/invalid-email':
            friendlyMessage = "Please enter a valid email address.";
            break;
        case 'auth/api-key-not-valid':
            friendlyMessage = "The Firebase API Key is not valid. Please check your configuration.";
            break;
        default:
          friendlyMessage = err.message;
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center items-center gap-2 text-foreground">
          <AppLogo className="size-8" />
          <span className="font-headline text-2xl font-bold">FOOTBET-WIN</span>
        </Link>
        <Card className="shadow-2xl">
            <CardHeader className="text-center">
                 <CardTitle>Create an Account</CardTitle>
                <CardDescription>Join to start making winning bets</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullname-signup">Nom complet</Label>
                        <Input id="fullname-signup" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefòn</Label>
                        <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode}>
                            <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <Label className="px-2 py-1.5 text-xs font-semibold">Amerik</Label>
                                <SelectItem value="+1">USA (+1)</SelectItem>
                                <SelectItem value="+1">Canada (+1)</SelectItem>
                                <SelectItem value="+509">Haiti (+509)</SelectItem>
                                <SelectItem value="+1-809">Dom. Rep. (+1-809)</SelectItem>
                                <SelectItem value="+55">Brazil (+55)</SelectItem>
                                <SelectItem value="+56">Chile (+56)</SelectItem>
                                <SelectItem value="+52">Mexico (+52)</SelectItem>
                            </SelectGroup>
                                <SelectGroup>
                                <Label className="px-2 py-1.5 text-xs font-semibold">Afrik</Label>
                                <SelectItem value="+234">Nigeria (+234)</SelectItem>
                                <SelectItem value="+221">Senegal (+221)</SelectItem>
                                <SelectItem value="+225">Côte d'Ivoire (+225)</SelectItem>
                                <SelectItem value="+233">Ghana (+233)</SelectItem>
                                <SelectItem value="+27">South Africa (+27)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Input id="phone-signup" placeholder="Phone number" required value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <div className="relative">
                        <Input id="password-signup" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referral-signup">Referral Code (Optional)</Label>
                        <Input id="referral-signup" placeholder="Enter referral code" value={referralId} onChange={(e) => setReferralId(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button onClick={handleSignup} className="w-full font-bold" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign Up
                    </Button>
                     <p className="text-center text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/login" className="font-bold underline text-primary">
                        Sign In
                      </Link>
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function SignupPageContainer() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
        <SignUpPage />
    </Suspense>
  )
}
