
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Crown, Radio, Star } from 'lucide-react';


type MatchFilterControlsProps = {
    selectedDate: string;
    isVip: boolean;
}

export function MatchFilterControls({ selectedDate, isVip }: MatchFilterControlsProps) {
    const router = useRouter();
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(() => {
        const initialDate = new Date(selectedDate);
        const timezoneOffset = initialDate.getTimezoneOffset() * 60000;
        return new Date(initialDate.getTime() + timezoneOffset);
    });
    
    // This state ensures the calendar is only rendered on the client
    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => {
      setIsClient(true);
    }, []);


    const handleDateSelect = (selectedDay: Date | undefined) => {
        if (selectedDay) {
            const dateString = selectedDay.toISOString().split('T')[0];
            router.push(`/matches?date=${dateString}`);
            setDate(selectedDay);
        }
        setPopoverOpen(false);
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/matches/live" className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-red-500" />
                    <span>LIVE</span>
                </Link>
            </Button>
            <div className="flex-grow"></div>
             <Button variant="outline" size="icon" asChild>
                <Link href="/matches/favorites">
                    <Star className="h-4 w-4 text-yellow-400" />
                </Link>
            </Button>
            {isClient && (
                 <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className={cn(!date && 'text-muted-foreground')}>
                        <CalendarIcon className="h-4 w-4" />
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
            )}
            {!isVip && (
                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-primary-foreground">
                    <Link href="/payments">
                        <Crown className="mr-2 h-4 w-4" /> 
                        <span>Subscription</span>
                    </Link>
                </Button>
            )}
        </div>
    );
}


      
