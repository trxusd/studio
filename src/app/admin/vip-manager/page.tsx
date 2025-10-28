
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminUsers, type AdminUser } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type UserWithVip = AdminUser & { isVip: boolean };

export default function VipManagerPage() {
    const { toast } = useToast();
    const [users, setUsers] = React.useState<UserWithVip[]>(() => 
        adminUsers.map(u => ({ ...u, isVip: u.status === 'Active' }))
    );

    const handleVipToggle = (userId: string, isVip: boolean) => {
        setUsers(currentUsers => 
            currentUsers.map(u => u.id === userId ? { ...u, isVip, status: isVip ? 'Active' : 'Inactive' } : u)
        );
        toast({
            title: "User Status Updated",
            description: `User ${userId} has been ${isVip ? 'activated' : 'deactivated'}.`,
        });
    };

    const handlePlanChange = (userId: string, newPlan: string) => {
        setUsers(currentUsers => 
            currentUsers.map(u => u.id === userId ? { ...u, plan: newPlan } : u)
        );
        toast({
            title: "User Plan Updated",
            description: `User ${userId}'s plan has been changed to ${newPlan}.`,
        });
    };

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
                {users.map(user => (
                    <TableRow key={user.id}>
                        <TableCell>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                             <Badge variant={user.isVip ? "default" : "outline"} className={user.isVip ? "bg-green-600" : ""}>
                                {user.isVip ? user.plan : 'None'}
                            </Badge>
                        </TableCell>
                        <TableCell>
                           <Switch
                                checked={user.isVip}
                                onCheckedChange={(checked) => handleVipToggle(user.id, checked)}
                                aria-label="Toggle VIP status"
                           />
                        </TableCell>
                         <TableCell>
                            <Select 
                                defaultValue={user.plan} 
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
      </CardContent>
    </Card>
  );
}
