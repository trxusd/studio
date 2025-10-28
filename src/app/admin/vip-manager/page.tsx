
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    isVip?: boolean;
    vipPlan?: string;
};

export default function VipManagerPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const usersQuery = firestore ? collection(firestore, 'users') : null;
    const { data: users, loading, error } = useCollection<UserProfile>(usersQuery);

    const handleVipToggle = async (userId: string, isVip: boolean) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userDocRef, { isVip });
            toast({
                title: "User Status Updated",
                description: `User's VIP status has been ${isVip ? 'activated' : 'deactivated'}.`,
            });
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to update user status.",
                variant: "destructive",
            });
        }
    };

    const handlePlanChange = async (userId: string, newPlan: string) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        try {
            await updateDoc(userDocRef, { vipPlan: newPlan });
            toast({
                title: "User Plan Updated",
                description: `User's plan has been changed to ${newPlan}.`,
            });
        } catch (err) {
             toast({
                title: "Error",
                description: "Failed to update user plan.",
                variant: "destructive",
            });
        }
    };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return <p className='text-destructive'>Error loading users: {error.message}</p>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>VIP Manager</CardTitle>
        <CardDescription>Manage VIP users and their subscription status.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Current Plan</TableHead>
                    <TableHead>VIP Status</TableHead>
                    <TableHead>Activate Plan</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users && users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="font-medium">{user.displayName || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                             <Badge variant={user.isVip ? "default" : "outline"} className={user.isVip ? "bg-green-600" : ""}>
                                {user.isVip ? user.vipPlan || 'Active' : 'None'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                           <Switch
                                checked={!!user.isVip}
                                onCheckedChange={(checked) => handleVipToggle(user.id, checked)}
                                aria-label="Toggle VIP status"
                           />
                        </TableCell>
                         <TableCell>
                            <Select 
                                value={user.vipPlan || ''} 
                                onValueChange={(value) => handlePlanChange(user.id, value)}
                                disabled={!user.isVip}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a plan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
                                    <SelectItem value="Yearly">Yearly</SelectItem>
                                    <SelectItem value="Lifetime">Lifetime</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {users && users.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
                <p>No users found in the database.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
