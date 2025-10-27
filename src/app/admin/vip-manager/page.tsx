
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VipManagerPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>VIP Manager</CardTitle>
        <CardDescription>Manage VIP users and their subscription status.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">VIP user management tools will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
