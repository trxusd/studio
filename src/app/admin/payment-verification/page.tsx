
'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from "@/firebase";
import { collection, doc, updateDoc, query, where, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

type Verification = {
    id: string;
    userId: string;
    userEmail: string;
    plan: string;
    amount: number;
    method: 'MonCash' | 'NatCash' | 'Crypto';
    transactionId: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    timestamp: Timestamp;
    screenshotUrl?: string; // It could be a data URI
};

export default function PaymentVerificationPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const verificationsQuery = firestore 
    ? query(collection(firestore, "paymentVerifications"), where("status", "==", "Pending")) 
    : null;

  const { data: verifications, loading } = useCollection<Verification>(verificationsQuery);

  const handleAction = async (verification: Verification, newStatus: 'Approved' | 'Rejected') => {
    if (!firestore) return;
    setIsProcessing(verification.id);

    try {
        const verificationDocRef = doc(firestore, 'paymentVerifications', verification.id);
        
        // Update the verification status
        await updateDoc(verificationDocRef, { status: newStatus });

        // If approved, update the user's profile
        if (newStatus === 'Approved') {
            const userDocRef = doc(firestore, 'users', verification.userId);
            await updateDoc(userDocRef, {
                isVip: true,
                vipPlan: verification.plan,
                // You could also add subscription start/end dates here
            });
        }
        
        toast({
            title: `Verification ${newStatus}`,
            description: `Payment from ${verification.userEmail} for ${verification.plan} plan has been ${newStatus.toLowerCase()}.`,
        });

    } catch (error) {
        console.error("Error processing verification:", error);
        toast({
            title: "Error",
            description: "Failed to process the verification request.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(null);
    }
  }
  
  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    return format(timestamp.toDate(), 'yyyy-MM-dd HH:mm');
  }

  const viewScreenshot = (url: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<img src="${url}" style="max-width: 100%; height: auto;" alt="Payment Screenshot">`);
      newWindow.document.title = "Payment Screenshot";
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification Queue</CardTitle>
        <CardDescription>Review and process pending payment verifications from users.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : verifications && verifications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>TXID / Screenshot</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div className="font-medium">{verification.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{verification.plan}</div>
                    <div className="text-sm text-muted-foreground">${verification.amount}</div>
                  </TableCell>
                   <TableCell>
                     <Badge variant="outline">{verification.method}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                     <div className="font-mono text-xs truncate">{verification.transactionId}</div>
                     {verification.screenshotUrl && (
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => viewScreenshot(verification.screenshotUrl!)}>
                            <Eye className="mr-1 h-3 w-3" /> View Screenshot
                        </Button>
                     )}
                  </TableCell>
                  <TableCell>{formatDate(verification.timestamp)}</TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                         <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" 
                            onClick={() => handleAction(verification, 'Approved')}
                            disabled={isProcessing === verification.id}
                        >
                            {isProcessing === verification.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Approve
                        </Button>
                         <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" 
                            onClick={() => handleAction(verification, 'Rejected')}
                            disabled={isProcessing === verification.id}
                        >
                             {isProcessing === verification.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Reject
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4">No pending payment verifications.</p>
            <p className="text-sm">The queue is all clear!</p>
          </div>
        )}
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>{verifications?.length || 0}</strong> pending verification(s).
            </div>
      </CardFooter>
    </Card>
  );
}
