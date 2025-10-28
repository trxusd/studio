
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

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const dateString = selectedDate.toISOString().split('T')[0];
            router.push(`/matches?date=${dateString}`);
        }
        setPopoverOpen(false);
    };

    const date = new Date(selectedDate);
    // Adjust for timezone offset to show the correct calendar day
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);


    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link href="/matches/live" passHref>
                <Button variant="outline">
                    <Radio className="mr-2 h-4 w-4 text-red-500" /> LIVE
                </Button>
            </Link>
             <Link href="/matches/favorites" passHref>
                <Button variant="outline">
                    <Star className="mr-2 h-4 w-4 text-yellow-400" /> Favorites
                </Button>
            </Link>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(adjustedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={adjustedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            {!isVip && (
                <Link href="/payments" passHref>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-primary-foreground">
                        <Crown className="mr-2 h-4 w-4" /> Become a VIP Member
                    </Button>
                </Link>
            )}
        </div>
    );
}


      
