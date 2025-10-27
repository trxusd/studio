
'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { automatedPaymentVerification } from "@/ai/flows/automated-payment-verification";
import { Crown, Loader2, Upload, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

type PaymentMethod = 'MonCash' | 'NatCash' | 'Crypto';

export default function PaymentsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('MonCash');
  const [email, setEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
      setFile(e.target.files[0]);
    }
  };
  
  const handleVerification = async () => {
    if (!email || !selectedPlan || !transactionId) {
      showErrorToast('Please fill out all required fields: Email, Plan, and Transaction ID.');
      return;
    }

    setIsVerifying(true);
    let paymentConfirmation = `Email: ${email}, Plan: ${selectedPlan}, TXID: ${transactionId}`;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const screenshotDataUri = reader.result as string;
        await verify(paymentConfirmation, screenshotDataUri);
      };
      reader.onerror = () => {
        showErrorToast('Error reading file.');
        setIsVerifying(false);
      }
    } else {
      await verify(paymentConfirmation);
    }
  };

  const verify = async (details: string, screenshotDataUri?: string) => {
     try {
      const result = await automatedPaymentVerification({
        paymentConfirmation: screenshotDataUri || details,
        paymentMethod: selectedPaymentMethod,
        expectedAmount: plans[selectedPlan as keyof typeof plans].price,
        userId: email, // Using email as user identifier
      });

      if (result.isVerified) {
        toast({
          title: "Payment Verification Submitted!",
          description: "We have received your confirmation and will verify it shortly.",
          variant: 'default',
        });
      } else {
        showErrorToast(result.verificationDetails || 'Verification failed. Please check the details and try again.');
      }
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

  if (userLoading || !user) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Payments & Subscriptions</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Subscription Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Crown className="text-yellow-500"/> Choose Your VIP Plan</CardTitle>
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
        </Card>

        {/* Payment and Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
            <CardDescription>Select a payment method and provide confirmation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block font-medium">1. Select Payment Method</Label>
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
              <h4 className='font-semibold mb-2'>Payment Information</h4>
              {selectedPaymentMethod === 'MonCash' && (
                <div className='text-sm'>
                  <p>Please send the payment to:</p>
                  <p><strong>Number:</strong> {paymentDetails.MonCash.info}</p>
                  <p><strong>Name:</strong> {paymentDetails.MonCash.name}</p>
                </div>
              )}
              {selectedPaymentMethod === 'NatCash' && (
                <div className='text-sm'>
                  <p>Please send the payment to:</p>
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

            <div>
              <Label className="mb-2 block font-medium">2. Provide Payment Confirmation</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required readOnly={!!user?.email} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                   <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger id="plan">
                          <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="monthly">1 Month - $5</SelectItem>
                          <SelectItem value="quarterly">3 Months - $10</SelectItem>
                          <SelectItem value="semi">6 Months - $30</SelectItem>
                          <SelectItem value="yearly">1 Year - $50</SelectItem>
                          <SelectItem value="lifetime">Lifetime - $100</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="transactionId">Transaction ID (ID, TXID)</Label>
                <Input id="transactionId" placeholder="Paste your transaction ID" value={transactionId} onChange={e => setTransactionId(e.target.value)} required />
              </div>
              <div className="mt-4 space-y-2">
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
          <CardFooter>
            <Button className="w-full font-bold" onClick={handleVerification} disabled={isVerifying}>
              {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verify Payment
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
