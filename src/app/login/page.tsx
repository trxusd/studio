
'use client';
import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AppLogo } from '@/components/icons';
import { Chrome, Facebook, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) {
      setError("Authentication service not available.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!" });
      router.push('/dashboard');
    } catch (err: any) {
      let friendlyMessage = "An unknown error occurred.";
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          friendlyMessage = "Incorrect email or password. Please try again.";
          break;
        case 'auth/wrong-password':
          friendlyMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        default:
          friendlyMessage = "Failed to sign in. Please check your credentials.";
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
      setError("Authentication service not available.");
      return;
    }
    setIsGoogleLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // If user document doesn't exist, create it.
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          isVip: false,
        });
        toast({ title: "Account created successfully!" });
      } else {
        toast({ title: "Welcome back!" });
      }
      
      router.push('/dashboard');

    } catch (err: any) {
      let friendlyMessage = "An unknown error occurred.";
      switch(err.code) {
        case 'auth/popup-closed-by-user':
          friendlyMessage = 'Sign-in process was cancelled.';
          break;
        case 'auth/account-exists-with-different-credential':
          friendlyMessage = 'An account already exists with this email address. Please sign in using the method you originally used.';
          break;
        default:
          friendlyMessage = 'Could not sign in with Google. Please try again.';
      }
      setError(friendlyMessage);
    } finally {
      setIsGoogleLoading(false);
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
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center items-center gap-2 text-foreground">
          <AppLogo className="size-8" />
          <span className="font-headline text-2xl font-bold">FOOTBET-WIN</span>
        </Link>
        <Card className="shadow-2xl">
            <CardHeader className="text-center">
                 <CardTitle>Sign In</CardTitle>
                <CardDescription>Sign in to access your predictions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
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
                  <Button onClick={handleSignIn} className="w-full font-bold" disabled={isLoading || isGoogleLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                   <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{' '}
                      <Link href="/signup" className="font-bold underline text-primary">
                        Sign Up
                      </Link>
                    </p>
                </div>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                     {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
                     Google
                  </Button>
                  <Button variant="outline"><Facebook className="mr-2 h-4 w-4" /> Facebook</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
            <AuthForm />
        </Suspense>
    )
}
