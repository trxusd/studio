'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { aiChatbotSupport } from '@/ai/flows/ai-chatbot-support';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from './icons';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const userQuery = query || input;
    if (!userQuery.trim()) return;

    const userMessage: Message = { role: 'user', content: userQuery };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiChatbotSupport({ query: userQuery });
      const botMessage: Message = { role: 'bot', content: result.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get a response from the chatbot.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const quickReplies = ["What is VIP?", "How to pay?", "What are the rules?"];

  return (
    <>
        <Sheet>
            <SheetTrigger asChild>
                <Button className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg" size="icon">
                    <MessageSquare className="h-8 w-8" />
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
            <SheetHeader>
                <SheetTitle className="font-headline flex items-center gap-2">
                    <MessageSquare className="text-primary"/> AI Support Chat
                </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4 -mx-6 my-4">
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'bot' && (
                        <Avatar className="h-8 w-8">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                               <AppLogo className="h-5 w-5"/>
                            </div>
                        </Avatar>
                    )}
                    <div className={`max-w-xs rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm">{message.content}</p>
                    </div>
                     {message.role === 'user' && (
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <Avatar className="h-8 w-8">
                           <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                               <AppLogo className="h-5 w-5"/>
                            </div>
                        </Avatar>
                        <div className="max-w-xs rounded-lg p-3 bg-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>

            <div className="mb-4 flex flex-wrap gap-2">
                {quickReplies.map(reply => (
                    <Button key={reply} variant="outline" size="sm" onClick={(e) => handleSendMessage(e, reply)} disabled={isLoading}>{reply}</Button>
                ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                    <Send className="h-4 w-4" />
                </Button>
            </form>
            </SheetContent>
        </Sheet>
    </>
  );
}
