
'use client';
import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ArrowLeft, Pin } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CommunityPostCard } from "@/components/community-post-card";
import { Badge } from "@/components/ui/badge";

export type Post = {
    id: string;
    user: { name: string; avatar: string; uid: string; };
    timestamp: any;
    content: string;
    likes: number;
    comments: number;
    likedBy: string[];
    isPinned?: boolean;
};

export default function CommunityPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Single, simple query to get all posts sorted by time.
    const allPostsQuery = firestore ? query(collection(firestore, "community-posts"), orderBy("timestamp", "desc")) : null;
    const { data: allPosts, loading: postsLoading } = useCollection<Post>(allPostsQuery);

    // We will perform the pinning logic on the client-side.
    const posts = useMemo(() => {
        if (!allPosts) return [];
        const pinned = allPosts.filter(p => p.isPinned);
        const unpinned = allPosts.filter(p => !p.isPinned);
        return [...pinned, ...unpinned];
    }, [allPosts]);
    

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [posts]);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const handleSendMessage = async () => {
        if (!user || !firestore || !newMessage.trim()) return;

        setIsSending(true);
        try {
            await addDoc(collection(firestore, "community-posts"), {
                user: {
                    name: user.displayName || "Anonymous User",
                    avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
                    uid: user.uid,
                },
                content: newMessage,
                timestamp: serverTimestamp(),
                likes: 0,
                comments: 0,
                likedBy: [],
                isPinned: false, // Explicitly set isPinned to false
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    if (userLoading || !user) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-5rem)]">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="p-4 border-b flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="md:hidden">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight">Community tchat</h2>
              <p className="text-muted-foreground">
                  Antre nan chat la, pataje prediksyon ou, epi konekte ak lòt itilizatè.
              </p>
            </div>
        </div>

      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="mx-auto max-w-3xl">
          {postsLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!postsLoading && posts && posts.map((post) => (
             <div key={post.id} className="relative">
                <CommunityPostCard post={post} />
                {post.isPinned && (
                    <Badge variant="secondary" className="absolute -top-3 left-4 text-xs font-semibold bg-primary/20 text-primary-foreground border-primary/30">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                    </Badge>
                )}
            </div>
          ))}
           {!postsLoading && (!posts || posts.length === 0) && (
            <div className="text-center text-muted-foreground py-12">
              <p>Pa gen mesaj nan chat la pou kounye a. Fè premye a!</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto bg-background border-t p-4">
        <div className="mx-auto max-w-3xl">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} alt="Your Avatar" />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Textarea 
                placeholder="What's on your mind? Share a prediction..." 
                className="flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                    }
                }}
                disabled={isSending}
              />
              <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
