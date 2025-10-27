
'use client';
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, orderBy, writeBatch } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from "next/navigation";
import Link from "next/link";

type Post = {
    id: string;
    user: { name: string; avatar: string, uid: string; };
    timestamp: any;
    content: string;
    likes: number;
    comments: number;
    likedBy: string[];
};

export default function CommunityPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const postsQuery = firestore ? query(collection(firestore, "community-posts"), orderBy("timestamp", "asc")) : null;
    const { data: posts, loading: postsLoading } = useCollection<Post>(postsQuery);

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
                likedBy: []
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleLike = async (postId: string, currentLikes: number, likedBy: string[]) => {
        if (!firestore || !user) return;
        const postRef = doc(firestore, "community-posts", postId);
        const batch = writeBatch(firestore);

        if (likedBy.includes(user.uid)) {
            // User has already liked, so unlike
            const newLikedBy = likedBy.filter(uid => uid !== user.uid);
            batch.update(postRef, {
                likes: currentLikes - 1,
                likedBy: newLikedBy
            });
        } else {
            // User has not liked, so like
            const newLikedBy = [...likedBy, user.uid];
            batch.update(postRef, {
                likes: currentLikes + 1,
                likedBy: newLikedBy
            });
        }
        await batch.commit();
    };
    
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate();
        return `${formatDistanceToNow(date)} ago`;
    }

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
            <Card key={post.id} className="overflow-hidden mb-6">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                <Avatar>
                  <AvatarImage src={post.user.avatar} alt={post.user.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                  <p className="font-semibold">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(post.timestamp)}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-4 bg-muted/50 p-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleLike(post.id, post.likes, post.likedBy || [])} disabled={!user}>
                  <ThumbsUp className={`h-4 w-4 ${post.likedBy?.includes(user.uid) ? 'text-primary fill-current' : ''}`} />
                  <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
              </CardFooter>
            </Card>
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
