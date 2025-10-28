
'use client';
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, MessageSquare, Send, Loader2, Languages } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, orderBy, writeBatch, increment } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { translateText } from "@/ai/flows/translate-text";
import type { Post } from "@/app/(app)/community/page";

type Comment = {
    id: string;
    user: { name:string; avatar:string; uid:string; };
    timestamp: any;
    content: string;
};

const LanguageSelector = ({ onSelect }: { onSelect: (lang: string) => void }) => {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
        { code: 'ht', name: 'Kreyòl Ayisyen' },
    ];
    return (
        <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-md">
            {languages.map(lang => (
                <Button key={lang.code} size="sm" variant="ghost" onClick={() => onSelect(lang.code)}>
                    {lang.name}
                </Button>
            ))}
        </div>
    );
};

const TranslatedContent = ({ originalContent }: { originalContent: string }) => {
    const [translatedContent, setTranslatedContent] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(true);
    const [showLangSelector, setShowLangSelector] = useState(false);

    const handleTranslate = async (targetLanguage: string) => {
        setIsTranslating(true);
        setShowLangSelector(false);
        try {
            const result = await translateText({ text: originalContent, targetLanguage });
            setTranslatedContent(result.translatedText);
            setShowOriginal(false);
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className="whitespace-pre-wrap">
            <p>{showOriginal ? originalContent : translatedContent}</p>
            <div className="flex items-center gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowLangSelector(!showLangSelector)} disabled={isTranslating}>
                    {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                    <span className="ml-2">Translate</span>
                </Button>
                {translatedContent && (
                    <Button variant="ghost" size="sm" onClick={() => setShowOriginal(!showOriginal)}>
                       {showOriginal ? 'Show Translation' : 'Show Original'}
                    </Button>
                )}
            </div>
            {showLangSelector && <LanguageSelector onSelect={handleTranslate} />}
        </div>
    );
}


export function CommunityPostCard({ post }: { post: Post }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        if (!firestore || !user) return;
        const postRef = doc(firestore, "community-posts", post.id);

        const isLiked = post.likedBy?.includes(user.uid);
        const batch = writeBatch(firestore);

        if (isLiked) {
            batch.update(postRef, {
                likes: increment(-1),
                likedBy: post.likedBy.filter(uid => uid !== user.uid)
            });
        } else {
            batch.update(postRef, {
                likes: increment(1),
                likedBy: [...(post.likedBy || []), user.uid]
            });
        }
        await batch.commit();
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        return `${formatDistanceToNow(timestamp.toDate())} ago`;
    };

    return (
        <Card className="overflow-hidden mb-6">
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
                <TranslatedContent originalContent={post.content} />
            </CardContent>
            <CardFooter className="flex items-center gap-4 bg-muted/50 p-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleLike} disabled={!user}>
                    <ThumbsUp className={`h-4 w-4 ${post.likedBy?.includes(user?.uid || '') ? 'text-primary fill-current' : ''}`} />
                    <span>{post.likes}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => setShowComments(!showComments)}>
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments}</span>
                </Button>
            </CardFooter>
            {showComments && <CommentSection postId={post.id} />}
        </Card>
    )
}


function CommentSection({ postId }: { postId: string }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [newComment, setNewComment] = useState("");
    const [isSending, setIsSending] = useState(false);

    const commentsQuery = firestore ? query(collection(firestore, "community-posts", postId, "comments"), orderBy("timestamp", "asc")) : null;
    const { data: comments, loading: commentsLoading } = useCollection<Comment>(commentsQuery);

    const handleCommentSubmit = async () => {
        if (!user || !firestore || !newComment.trim()) return;

        setIsSending(true);
        try {
            const postRef = doc(firestore, "community-posts", postId);
            await addDoc(collection(firestore, "community-posts", postId, "comments"), {
                user: {
                    name: user.displayName || "Anonymous",
                    avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
                    uid: user.uid,
                },
                content: newComment,
                timestamp: serverTimestamp(),
            });
            // Increment comment count on parent post
            await updateDoc(postRef, {
                comments: increment(1)
            });
            setNewComment("");
        } catch (error) {
            console.error("Error adding comment:", error);
        } finally {
            setIsSending(false);
        }
    };
    
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'Just now';
        return `${formatDistanceToNow(timestamp.toDate())} ago`;
    };

    return (
        <div className="p-4 border-t">
            {commentsLoading && <div className="flex justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>}
            
            <div className="space-y-4 mb-4">
                {!commentsLoading && comments?.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user.avatar} alt={comment.user.name} data-ai-hint="person portrait"/>
                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                             <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                <p className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</p>
                             </div>
                            <TranslatedContent originalContent={comment.content} />
                        </div>
                    </div>
                ))}
                 {!commentsLoading && (!comments || comments.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center">No comments yet. Be the first to reply!</p>
                 )}
            </div>

            {user && (
                 <div className="flex items-start gap-3">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center gap-2">
                         <Textarea 
                            placeholder="Write a comment..." 
                            className="flex-1"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={1}
                            disabled={isSending}
                          />
                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleCommentSubmit} disabled={isSending || !newComment.trim()}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
