
'use client';
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Send, Loader2 } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { formatDistanceToNow } from 'date-fns';

type Post = {
    id: string;
    user: { name: string; avatar: string, uid: string; };
    timestamp: any;
    content: string;
    likes: number;
    comments: number;
};

export default function CommunityPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const postsQuery = firestore ? query(collection(firestore, "community-posts"), orderBy("timestamp", "asc")) : null;
    const { data: posts, loading: postsLoading } = useCollection<Post>(postsQuery);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [posts]);


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
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleLike = async (postId: string, currentLikes: number) => {
        if (!firestore) return;
        const postRef = doc(firestore, "community-posts", postId);
        await updateDoc(postRef, {
            likes: currentLikes + 1
        });
    };
    
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate();
        return `${formatDistanceToNow(date)} ago`;
    }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="p-4 border-b">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Community tchat</h2>
            <p className="text-muted-foreground">
                Antre nan chat la, pataje prediksyon ou, epi konekte ak lòt itilizatè.
            </p>
        </div>

      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="mx-auto max-w-3xl">
          {postsLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {!postsLoading && posts.map((post) => (
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
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleLike(post.id, post.likes)}>
                  <ThumbsUp className="h-4 w-4" />
                  <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.comments}</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
           {!postsLoading && posts.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
              <p>Pa gen mesaj nan chat la pou kounye a. Fè premye a!</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-auto bg-background border-t p-4">
        <div className="mx-auto max-w-3xl">
           {userLoading ? (
             <p className="text-sm text-muted-foreground">Loading...</p>
           ) : user ? (
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
              <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSendMessage} disabled={isSending}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
           ): (
            <p className="text-sm text-muted-foreground">Tanpri <a href="/login" className="underline">konekte w</a> pou w patisipe nan chat la.</p>
           )}
        </div>
      </div>
    </div>
  );
}

