
'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';
import { Chrome, Facebook, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+509');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('signin');
  
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  const [referralId, setReferralId] = useState(referralCode || '');


  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = async (action: 'signin' | 'signup') => {
    if (!auth || !firestore) {
      setError("Authentication service not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (action === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back!" });
      } else {
        // Signup logic
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
            const uidPart = referralId.substring(4, 12);
            if(uidPart) {
                // We just store the potential referrer UID, validation can happen on the backend or later
                referredBy = uidPart;
            }
        }

        // Create user document in Firestore
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
      }
      router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = "An unknown error occurred.";
      switch (err.code) {
        case 'auth/user-not-found':
          friendlyMessage = "No account found with this email. Please sign up.";
          break;
        case 'auth/wrong-password':
          friendlyMessage = "Incorrect password. Please try again.";
          break;
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

  const handlePasswordReset = () => {
    if (!auth || !email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for password reset instructions.",
        });
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setCountryCode('+509');
    setError(null);
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center items-center gap-2 text-foreground">
          <AppLogo className="size-8" />
          <span className="font-headline text-2xl font-bold">FOOTBET-WIN</span>
        </Link>
        <Card className="shadow-2xl">
          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            clearForm();
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            {/* Sign In Tab */}
            <TabsContent value="signin">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Welcome Back</CardTitle>
                <CardDescription>Sign in to access your predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-signin">Email</Label>
                  <Input id="email-signin" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Label htmlFor="password-signin">Password</Label>
                    <Button variant="link" className="ml-auto inline-block h-auto p-0 text-sm" onClick={handlePasswordReset}>
                      Forgot your password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input id="password-signin" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                    </Button>
                  </div>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button onClick={() => handleAuthAction('signin')} className="w-full font-bold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline"><Chrome className="mr-2 h-4 w-4" /> Google</Button>
                  <Button variant="outline"><Facebook className="mr-2 h-4 w-4" /> Facebook</Button>
                </div>
              </CardContent>
            </TabsContent>
            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Create an Account</CardTitle>
                <CardDescription>Join to start making winning bets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                <Button onClick={() => handleAuthAction('signup')} className="w-full font-bold" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Sign Up
                </Button>
                 <p className="px-8 text-center text-sm text-muted-foreground">
                    By clicking continue, you agree to our{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-primary">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="underline underline-offset-4 hover:text-primary">
                        Privacy Policy
                    </Link>
                    .
                </p>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <LoginForm />
        </Suspense>
    )
}
