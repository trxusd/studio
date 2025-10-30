
'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, query, orderBy, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Loader2, Megaphone, Lock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { LinkRenderer } from '@/components/link-renderer';

type Announcement = {
    id: string;
    title: string;
    message: string;
    priority: 'Normal' | 'Urgent';
    target: 'all' | 'vip' | 'free';
    createdAt: Timestamp;
    readBy: string[];
    isLocked?: boolean;
};

export default function AnnouncementsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const prevAnnouncementsRef = useRef<Announcement[]>();
    
    const announcementsQuery = firestore 
        ? query(collection(firestore, 'announcements'), orderBy('createdAt', 'desc'))
        : null;

    const { data: allAnnouncements, loading } = useCollection<Announcement>(announcementsQuery);
    const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);

    useEffect(() => {
        if (!loading && allAnnouncements && prevAnnouncementsRef.current) {
            if (allAnnouncements.length > prevAnnouncementsRef.current.length) {
                const newAnnouncement = allAnnouncements[0];
                
                const isVip = false; // Placeholder
                let isVisible = false;
                if (newAnnouncement.target === 'all') isVisible = true;
                if (newAnnouncement.target === 'vip' && isVip) isVisible = true;
                if (newAnnouncement.target === 'free' && !isVip) isVisible = true;
                if (!user && newAnnouncement.target === 'all') isVisible = true;


                if (isVisible) {
                    toast({
                        title: `New Announcement: ${newAnnouncement.title}`,
                        description: newAnnouncement.message.substring(0, 100) + '...',
                    });
                }
            }
        }
        prevAnnouncementsRef.current = allAnnouncements || undefined;
    }, [allAnnouncements, loading, toast, user]);


    useEffect(() => {
        if (loading || !allAnnouncements) {
            if (allAnnouncements) {
                setVisibleAnnouncements(allAnnouncements.filter(a => a.target === 'all'));
            }
            return;
        }

        if (!user) {
            setVisibleAnnouncements(allAnnouncements.filter(ann => ann.target === 'all'));
            return;
        }

        const filterAnnouncements = async () => {
             const isVip = false; 

             const filtered = allAnnouncements.filter(ann => {
                if (ann.target === 'all') return true;
                if (ann.target === 'vip' && isVip) return true;
                if (ann.target === 'free' && !isVip) return true;
                return false;
             });
             setVisibleAnnouncements(filtered);
        }

        setVisibleAnnouncements(allAnnouncements);


    }, [allAnnouncements, user, loading, firestore]);

    const handleMarkAsRead = async (announcementId: string) => {
        if (!firestore || !user || visibleAnnouncements.find(a => a.id === announcementId)?.readBy.includes(user.uid)) return;

        const announcementRef = doc(firestore, 'announcements', announcementId);
        try {
            await updateDoc(announcementRef, {
                readBy: arrayUnion(user.uid)
            });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };
    

    const formatTimestamp = (timestamp: Timestamp) => {
        if (!timestamp) return 'No date';
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    };

    return (
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight flex items-center gap-2">
                <Megaphone className="h-8 w-8"/>
                Announcements
            </h2>
            <p className="text-muted-foreground">
                Stay updated with the latest news and updates from the FOOTBET-WIN team.
            </p>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : visibleAnnouncements.length === 0 ? (
                 <Card className="text-center p-12">
                    <p className="text-muted-foreground">No announcements right now. Check back later!</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {visibleAnnouncements.map(announcement => {
                        const isRead = user ? announcement.readBy?.includes(user.uid) : false;
                        return (
                            <Card key={announcement.id} className={cn("transition-opacity", isRead && "opacity-60 hover:opacity-100")}>
                                <CardHeader className="flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {announcement.isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                                            {announcement.title}
                                        </CardTitle>
                                        <CardDescription>
                                            Posted {formatTimestamp(announcement.createdAt)}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={announcement.priority === 'Urgent' ? 'destructive' : 'default'}>
                                        {announcement.priority}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <LinkRenderer text={announcement.message} />
                                </CardContent>
                                {user && !isRead && (
                                     <CardFooter>
                                        <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(announcement.id)}>
                                            Mark as Read
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
