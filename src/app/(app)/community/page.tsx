import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { communityPosts } from "@/lib/data";
import { ThumbsUp, MessageSquare, Send } from "lucide-react";

export default function CommunityPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Community Feed</h2>
      <p className="text-muted-foreground">
        Join the discussion, share your predictions, and connect with other bettors.
      </p>

      <div className="mx-auto max-w-3xl">
        {/* Create Post Card */}
        <Card className="mb-6">
          <CardHeader className='p-4'>
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src="https://picsum.photos/seed/user/40/40" alt="Your Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <Textarea placeholder="What's on your mind? Share a prediction..." className="flex-1" />
            </div>
          </CardHeader>
          <CardFooter className="flex justify-end p-4 pt-0">
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Post
            </Button>
          </CardFooter>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {communityPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
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
    </div>
  );
}
