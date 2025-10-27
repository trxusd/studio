
'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { communityPosts } from "@/lib/data";
import { ThumbsUp, MessageSquare, Send } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
        <div className="p-4 border-b">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Community tchat</h2>
            <p className="text-muted-foreground">
                Antre nan chat la, pataje prediksyon ou, epi konekte ak lòt itilizatè.
            </p>
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Feed */}
        <div className="mx-auto max-w-3xl">
          {communityPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden mb-6">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
                <Avatar>
                  <AvatarImage src={post.user.avatar} alt={post.user.name} data-ai-hint="person portrait" />
                  <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                  <p className="font-semibold">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
              <CardFooter className="flex items-center gap-4 bg-muted/50 p-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
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
        </div>
      </div>
      
       {/* Create Post Area */}
      <div className="mt-auto bg-background border-t p-4">
        <div className="mx-auto max-w-3xl">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="Your Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Textarea placeholder="What's on your mind? Share a prediction..." className="flex-1" />
              <Button size="icon" className="h-10 w-10 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
