
'use client';

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { adminPaymentVerifications } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type Verification = typeof adminPaymentVerifications[0];

export default function PaymentVerificationPage() {
  const [verifications, setVerifications] = useState(adminPaymentVerifications);
  const { toast } = useToast();

  const handleAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setVerifications(verifications.map(v => v.id === id ? { ...v, status: newStatus } : v));
    toast({
        title: `Verification ${newStatus}`,
        description: `The payment verification has been marked as ${newStatus.toLowerCase()}.`
    })
  }

  const pendingVerifications = verifications.filter(v => v.status === 'Pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification Queue</CardTitle>
        <CardDescription>Review and process pending payment verifications from users.</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingVerifications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>TXID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingVerifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div className="font-medium">{verification.userId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{verification.plan}</div>
                    <div className="text-sm text-muted-foreground">${verification.amount}</div>
                  </TableCell>
                   <TableCell>
                     <Badge variant="outline">{verification.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{verification.transactionId}</TableCell>
                  <TableCell>{verification.timestamp}</TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleAction(verification.id, 'Approved')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                         <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700" onClick={() => handleAction(verification.id, 'Rejected')}>
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No pending payment verifications.</p>
          </div>
        )}
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>{pendingVerifications.length}</strong> pending verification(s).
            </div>
      </CardFooter>
    </Card>
  );
}
