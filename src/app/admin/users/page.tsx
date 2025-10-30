
'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Loader2, ArrowLeft } from "lucide-react";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from "react";
import { format } from 'date-fns';
import Link from "next/link";

type UserProfile = {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    isVip?: boolean;
    vipPlan?: string;
    createdAt?: { seconds: number, nanoseconds: number };
};


export default function AdminUsersPage() {
    const firestore = useFirestore();
    const usersQuery = firestore ? query(collection(firestore, 'users'), where('isVip', '==', true)) : null;
    const { data: vipUsers, loading } = useCollection<UserProfile>(usersQuery);

    const formatDate = (timestamp: { seconds: number, nanoseconds: number } | undefined) => {
        if (!timestamp) return 'N/A';
        return format(new Date(timestamp.seconds * 1000), 'yyyy-MM-dd');
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>VIP Users</CardTitle>
                        <CardDescription>Manage your VIP users and their subscriptions.</CardDescription>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : vipUsers && vipUsers.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Joined On</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vipUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.displayName || user.email || 'N/A'}</div>
                                        <div className="text-sm text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.isVip ? 'default' : 'destructive'} className={user.isVip ? 'bg-green-600' : ''}>
                                            {user.isVip ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{user.vipPlan || 'N/A'}</TableCell>
                                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                                <DropdownMenuItem>Deactivate VIP</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No VIP users found.</p>
                    </div>
                )}
            </CardContent>
             <CardFooter>
                 <div className="text-xs text-muted-foreground">
                    Showing <strong>{vipUsers?.length || 0}</strong> VIP user(s).
                </div>
            </CardFooter>
        </Card>
    );
}
