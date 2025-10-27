
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentVerificationPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification</CardTitle>
        <CardDescription>Review and process pending payment verifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Payment verification queue will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
