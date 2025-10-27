'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { automatedPaymentVerification } from "@/ai/flows/automated-payment-verification";
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Crown, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('MonCash');
  const [verificationInput, setVerificationInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const plans = {
    monthly: { name: 'Monthly', price: 10, id: 'monthly' },
    quarterly: { name: 'Quarterly', price: 25, id: 'quarterly' },
    yearly: { name: 'Yearly', price: 80, id: 'yearly' },
  };

  const paymentMethods = [
    { id: 'MonCash', name: 'MonCash', imageId: 'payment-moncash' },
    { id: 'Crypto', name: 'Crypto', imageId: 'payment-crypto' },
    { id: 'Visa', name: 'Visa', imageId: 'payment-visa' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVerificationInput('');
    }
  };
  
  const handleVerification = async () => {
    setIsVerifying(true);
    const expectedAmount = plans[selectedPlan as keyof typeof plans].price;
    let paymentConfirmation = verificationInput;

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        paymentConfirmation = reader.result as string;
        await verify(paymentConfirmation);
      };
      reader.onerror = () => {
        showErrorToast('Error reading file.');
        setIsVerifying(false);
      }
    } else if (verificationInput) {
      await verify(verificationInput);
    } else {
        showErrorToast('Please provide a Transaction ID/Email or upload a screenshot.');
        setIsVerifying(false);
    }
  };

  const verify = async (paymentConfirmation: string) => {
     try {
      const result = await automatedPaymentVerification({
        paymentConfirmation,
        paymentMethod: selectedPaymentMethod as 'MonCash' | 'Crypto' | 'Visa',
        expectedAmount: plans[selectedPlan as keyof typeof plans].price,
        userId: 'user-123',
      });

      if (result.isVerified) {
        toast({
          title: "Payment Verified!",
          description: result.verificationDetails,
          variant: 'default',
        });
      } else {
        showErrorToast(result.verificationDetails || 'Verification failed. Please try again or contact support.');
      }
    } catch (error) {
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
                  <span className="font-bold text-lg">{plan.name} Plan</span>
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.name === 'Yearly' ? 'Best Value' : (plan.name === 'Quarterly' ? 'Most Popular' : 'Get Started')}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Payment and Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Complete Your Purchase</CardTitle>
            <CardDescription>Select a payment method and verify your transaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-2 block font-medium">1. Select Payment Method</Label>
               <RadioGroup defaultValue="MonCash" className="grid grid-cols-3 gap-4" onValueChange={setSelectedPaymentMethod}>
                {paymentMethods.map(method => {
                  const image = PlaceHolderImages.find(img => img.id === method.imageId);
                  return (
                    <div key={method.id}>
                      <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                      <Label htmlFor={method.id} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                        {image && <Image src={image.imageUrl} alt={method.name} width={80} height={50} className="mb-2 object-contain" data-ai-hint={image.imageHint}/>}
                        {method.name}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            <div>
              <Label className="mb-2 block font-medium">2. Provide Payment Confirmation</Label>
              <div className="space-y-2">
                <Label htmlFor="verification-input" className="text-sm text-muted-foreground">Transaction ID or Confirmation Email Body</Label>
                <Textarea
                  id="verification-input"
                  placeholder="Paste your transaction ID or email content here..."
                  value={verificationInput}
                  onChange={(e) => { setVerificationInput(e.target.value); setFile(null); }}
                  disabled={!!file}
                />
              </div>

              <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
              </div>

              <div>
                  <Label htmlFor="screenshot-upload" className="text-sm text-muted-foreground">Upload Screenshot</Label>
                  <div className="mt-2 flex items-center justify-center w-full">
                      <label htmlFor="screenshot-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground"/>
                              <p className="mb-2 text-sm text-muted-foreground">{file ? file.name : <><span className="font-semibold">Click to upload</span> or drag and drop</>}</p>
                              <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
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
