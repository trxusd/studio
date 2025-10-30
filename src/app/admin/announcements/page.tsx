
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Megaphone, Lock, ArrowLeft } from "lucide-react";
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

export default function AdminAnnouncementsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
    const [target, setTarget] = useState<'all' | 'vip' | 'free'>('all');
    const [isLocked, setIsLocked] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    
    const firestore = useFirestore();
    const { toast } = useToast();

    const handlePublish = async () => {
        if (!firestore || !title.trim() || !message.trim()) {
            toast({
                title: "Error",
                description: "Title and message cannot be empty.",
                variant: "destructive",
            });
            return;
        }

        setIsPublishing(true);
        try {
            await addDoc(collection(firestore, 'announcements'), {
                title,
                message,
                priority,
                target,
                createdAt: serverTimestamp(),
                readBy: [], // To track which users have read it
                isLocked, // Add lock status
            });

            toast({
                title: "Announcement Published!",
                description: "Your announcement is now live for users to see.",
            });

            // Reset form
            setTitle('');
            setMessage('');
            setPriority('Normal');
            setTarget('all');
            setIsLocked(false);

        } catch (error) {
            console.error("Error publishing announcement:", error);
            toast({
                title: "Publishing Failed",
                description: "An error occurred while publishing the announcement.",
                variant: "destructive",
            });
        } finally {
            setIsPublishing(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Megaphone className="text-primary" />
                        <CardTitle>Create Announcement</CardTitle>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
                    </Button>
                </div>
                <CardDescription>
                    Broadcast a global message to your users. It will appear on the announcements page.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., System Maintenance Alert" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your detailed announcement here... You can include links like https://example.com" rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                         <Select value={priority} onValueChange={(v: 'Normal' | 'Urgent') => setPriority(v)}>
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Normal">Normal</SelectItem>
                                <SelectItem value="Urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="target">Target Audience</Label>
                         <Select value={target} onValueChange={(v: 'all' | 'vip' | 'free') => setTarget(v)}>
                            <SelectTrigger id="target">
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="vip">VIP Users</SelectItem>
                                <SelectItem value="free">Free Users</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id="lock-announcement" checked={isLocked} onCheckedChange={setIsLocked} />
                    <Label htmlFor="lock-announcement" className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Lock announcement (prevents accidental deletion)
                    </Label>
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handlePublish} disabled={isPublishing} className="w-full">
                    {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publish Announcement
                </Button>
            </CardFooter>
        </Card>
    );
}
