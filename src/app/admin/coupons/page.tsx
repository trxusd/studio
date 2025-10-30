
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminCoupons } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCouponsPage() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Coupons</CardTitle>
                        <CardDescription>Generate and manage promotional coupons for your users.</CardDescription>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                        </Button>
                        <Button>Generate Coupon</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uses</TableHead>
                            <TableHead>Expires On</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adminCoupons.map(coupon => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-mono">{coupon.code}</TableCell>
                                <TableCell>{coupon.discount}</TableCell>
                                <TableCell>
                                     <Badge variant={coupon.status === 'Active' ? 'default' : 'secondary'} className={coupon.status === 'Active' ? 'bg-green-600' : ''}>
                                        {coupon.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{coupon.uses}</TableCell>
                                <TableCell>{coupon.expires}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                 <div className="text-xs text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong> coupons
                </div>
            </CardFooter>
        </Card>
    );
}
