
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { automatedPaymentVerification } from "@/ai/flows/automated-payment-verification";
import { Crown, Loader2, Upload, Copy, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

type PaymentMethod = 'MonCash' | 'NatCash' | 'Crypto';
type Step = 'select-plan' | 'select-method' | 'verify-payment';

export default function PaymentsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<Step>('select-plan');
  const [selectedPlan, setSelectedPlan] = useState('quarterly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('MonCash');
  const [email, setEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [screenshotDataUri, setScreenshotDataUri] = useState<string | null>(null);


  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setEmail(user.email || '');
    }
  }, [user, userLoading, router]);

  const plans = {
    monthly: { name: '1 Month', price: 5, htg: '~660 HTG', id: 'monthly', popular: false, value:'' },
    quarterly: { name: '3 Months', price: 10, htg: '~1325 HTG', id: 'quarterly', popular: true, value:'' },
    semi: { name: '6 Months', price: 30, htg: '~3975 HTG', id: 'semi', popular: false, value: 'Good Value' },
    yearly: { name: '1 Year', price: 50, htg: '~6625 HTG', id: 'yearly', popular: false, value: 'Best Value' },
    lifetime: { name: 'Lifetime', price: 100, htg: '~13250 HTG', id: 'lifetime', popular: false, value: 'Ultimate' },
  };

  const paymentMethods = [
    { id: 'MonCash', name: 'MonCash' },
    { id: 'NatCash', name: 'NatCash' },
    { id: 'Crypto', name: 'Crypto' },
  ];
  
  const paymentDetails = {
    MonCash: { info: "37471410", name: "Joachim" },
    NatCash: { info: "40050381", name: "Joachim" },
    Crypto: {
      trc20: "TWP3LT4mdKisaAQ1R9WhHF98fcmoW5VYcG",
      polygon: "0x285e10fbb08a706996f7e356705337aa1d7be05c"
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: text,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = () => {
        setScreenshotDataUri(reader.result as string);
      };
      reader.onerror = () => {
        showErrorToast('Error reading file.');
        setScreenshotDataUri(null);
      }
    }
  };
  
  const handleVerification = async () => {
    if (!email || !selectedPlan || !transactionId || !user) {
      showErrorToast('Please fill out all required fields: Email, Plan, and Transaction ID.');
      return;
    }

    setIsVerifying(true);
    let paymentConfirmation = `Email: ${email}, Plan: ${selectedPlan}, TXID: ${transactionId}`;
    
    await verify(paymentConfirmation, screenshotDataUri || undefined);
  };

  const verify = async (details: string, screenshot?: string) => {
     try {
      if (!firestore || !user) throw new Error("Database or user not available.");

      const result = await automatedPaymentVerification({
        paymentConfirmation: details,
        paymentMethod: selectedPaymentMethod,
        expectedAmount: plans[selectedPlan as keyof typeof plans].price,
        userId: email, // Using email as user identifier
        screenshotDataUri: screenshot,
      });

      // Save to Firestore for manual admin verification
      await addDoc(collection(firestore, 'paymentVerifications'), {
        userId: user.uid,
        userEmail: email,
        plan: plans[selectedPlan as keyof typeof plans].name,
        amount: plans[selectedPlan as keyof typeof plans].price,
        method: selectedPaymentMethod,
        transactionId: transactionId,
        status: 'Pending',
        timestamp: serverTimestamp(),
        aiVerificationResult: result,
        screenshotUrl: screenshot, // Save the data URI
      });

      if (result.isVerified) {
        toast({
          title: "Payment Verification Submitted!",
          description: "We have received your confirmation and will verify it shortly. AI has pre-approved your request.",
          variant: 'default',
        });
      } else {
        toast({
          title: "Payment Verification Submitted!",
          description: "We have received your confirmation. It requires manual review. We will process it shortly.",
          variant: 'default'
        });
      }
      
      // Reset form
      setCurrentStep('select-plan');
      setSelectedPlan('quarterly');
      setTransactionId('');
      setFile(null);
      setScreenshotDataUri(null);

    } catch (error) {
      console.error(error);
      showErrorToast('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  }

  const showErrorToast = (message: string) => {
    toast({
      title: "Verification Failed",
      description: message,
      variant: "destructive",
    });
  };

  const nextStep = () => {
    if (currentStep === 'select-plan') setCurrentStep('select-method');
    else if (currentStep === 'select-method') setCurrentStep('verify-payment');
  }

  const prevStep = () => {
    if (currentStep === 'verify-payment') setCurrentStep('select-method');
    else if (currentStep === 'select-method') setCurrentStep('select-plan');
  }


  if (userLoading || !user) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        {currentStep !== 'select-plan' && (
          <Button variant="outline" size="icon" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="font-headline text-3xl font-bold tracking-tight">Payments & Subscriptions</h2>
      </div>

      <div className="mx-auto max-w-2xl">
        {currentStep === 'select-plan' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-yellow-500"/> 1. Choose Your VIP Plan</CardTitle>
              <CardDescription>Select a plan that suits you best.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
                {Object.values(plans).map(plan => (
                  <Label key={plan.id} htmlFor={plan.id} className={cn("flex flex-col items-start space-y-1 rounded-md border p-4 cursor-pointer transition-all", selectedPlan === plan.id && "border-primary ring-2 ring-primary")}>
                    <RadioGroupItem value={plan.id} id={plan.id} className="sr-only" />
                    <div className="flex justify-between w-full items-center">
                      <span className="font-bold text-lg">{plan.name}</span>
                      {plan.popular && <Badge variant="default">Most Popular</Badge>}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">({plan.htg})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{plan.value || `Get started with the ${plan.name} plan`}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={nextStep}>Next Step</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 'select-method' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">2. Complete Your Purchase</CardTitle>
              <CardDescription>Select a payment method and follow the instructions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block font-medium">Select Payment Method</Label>
                  <RadioGroup value={selectedPaymentMethod} className="grid grid-cols-3 gap-4" onValueChange={(v) => setSelectedPaymentMethod(v as PaymentMethod)}>
                    {paymentMethods.map(method => (
                        <Label htmlFor={method.id} key={method.id} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                          <RadioGroupItem value={method.id} id={method.id} className="sr-only" />
                          {method.name}
                        </Label>
                      )
                    )}
                  </RadioGroup>
                </div>
                
                <div className='p-4 border rounded-lg bg-muted/50'>
                  <h4 className='font-semibold mb-2'>Payment Information for {selectedPaymentMethod}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Please send <strong>${plans[selectedPlan as keyof typeof plans].price} USD ({plans[selectedPlan as keyof typeof plans].htg})</strong> to the details below.
                  </p>
                  {selectedPaymentMethod === 'MonCash' && (
                    <div className='text-sm'>
                      <p><strong>Number:</strong> {paymentDetails.MonCash.info}</p>
                      <p><strong>Name:</strong> {paymentDetails.MonCash.name}</p>
                    </div>
                  )}
                  {selectedPaymentMethod === 'NatCash' && (
                    <div className='text-sm'>
                      <p><strong>Number:</strong> {paymentDetails.NatCash.info}</p>
                      <p><strong>Name:</strong> {paymentDetails.NatCash.name}</p>
                    </div>
                  )}
                  {selectedPaymentMethod === 'Crypto' && (
                    <div className='text-sm space-y-2'>
                      <p>Send <strong>USDT</strong> to one of the following addresses:</p>
                      <div>
                        <strong className='block'>TRC20 (Tron Network):</strong>
                        <div className="flex items-center gap-2">
                          <span className='truncate text-muted-foreground'>{paymentDetails.Crypto.trc20}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentDetails.Crypto.trc20)}><Copy className='h-4 w-4'/></Button>
                        </div>
                      </div>
                      <div>
                        <strong className='block'>Polygon (Matic Network):</strong>
                        <div className="flex items-center gap-2">
                          <span className='truncate text-muted-foreground'>{paymentDetails.Crypto.polygon}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentDetails.Crypto.polygon)}><Copy className='h-4 w-4'/></Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                 <Button variant="outline" onClick={prevStep}>Back</Button>
                 <Button className="w-full" onClick={nextStep}>Next: Verify Payment</Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 'verify-payment' && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">3. Verify Payment</CardTitle>
              <CardDescription>Provide your payment confirmation details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required readOnly={!!user?.email} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="plan">Plan</Label>
                          <Input id="plan" value={`${plans[selectedPlan as keyof typeof plans].name} - $${plans[selectedPlan as keyof typeof plans].price}`} disabled />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">Transaction ID (ID, TXID)</Label>
                      <Input id="transactionId" placeholder="Paste your transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="screenshot-upload">Upload Screenshot (Optional)</Label>
                      <div className="flex items-center justify-center w-full">
                          <label htmlFor="screenshot-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <Upload className="w-8 h-8 mb-2 text-muted-foreground"/>
                                  <p className="mb-2 text-sm text-muted-foreground">{file ? file.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG or GIF</p>
                              </div>
                              <Input id="screenshot-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                          </label>
                      </div> 
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
               <Button variant="outline" onClick={prevStep}>Back</Button>
              <Button className="w-full font-bold" onClick={handleVerification} disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Verification
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
