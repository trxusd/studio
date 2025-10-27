'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Crown,
  Radio,
  Search,
  Star,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { matches } from '@/lib/data';

// Mock data grouped by country and league
const groupedMatches = matches.reduce(
  (acc, match) => {
    const country = match.league.split(' - ')[0] || 'Unknown'; // Simple grouping logic
    const league = match.league;
    if (!acc[country]) {
      acc[country] = {};
    }
    if (!acc[country][league]) {
      acc[country][league] = [];
    }
    acc[country][league].push(match);
    return acc;
  },
  {} as Record<string, Record<string, typeof matches>>
);

const countryFlags: Record<string, string> = {
    'La Liga': 'https://picsum.photos/seed/spain-flag/32/20',
    'Premier League': 'https://picsum.photos/seed/england-flag/32/20',
    'Bundesliga': 'https://picsum.photos/seed/germany-flag/32/20',
    'Ligue 1': 'https://picsum.photos/seed/france-flag/32/20'
}


export default function MatchesPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isVip] = React.useState(false); // Mock vip status

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    // Close popover logic would be handled by Popover's internals
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="md:hidden">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Matches
          </h2>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-14 z-10 bg-background/80 backdrop-blur-sm -mx-4 md:-mx-8 px-4 md:px-8 py-2 border-b">
         <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="search" placeholder="Search for a team..." className="pl-10" />
          {/* Search results would pop up here */}
        </div>
        <div className="flex flex-wrap items-center gap-2">
            <Link href="/matches/live" passHref>
                <Button variant="outline">
                    <Radio className="mr-2 h-4 w-4 text-red-500" /> LIVE
                </Button>
            </Link>
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
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
            <Link href="/matches/favorites" passHref>
                <Button variant="outline">
                    <Star className="mr-2 h-4 w-4" /> Favorites
                </Button>
            </Link>
            {!isVip && (
                <Link href="/payments" passHref>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-primary-foreground">
                        <Crown className="mr-2 h-4 w-4" /> Become a VIP Member
                    </Button>
                </Link>
            )}
        </div>
      </div>

      {/* Matches List */}
      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedMatches).map(([country, leagues]) => (
          <AccordionItem value={country} key={country}>
            <AccordionTrigger className="font-bold text-lg hover:no-underline">
              <div className="flex items-center gap-3">
                 <Image src={countryFlags[Object.keys(leagues)[0]] || "https://picsum.photos/seed/default-flag/32/20"} alt={`${country} flag`} width={32} height={20} className="rounded-sm" data-ai-hint="country flag" />
                {country.includes('Liga') ? 'Spain' : country.includes('Premier') ? 'England' : country.includes('Bundesliga') ? 'Germany' : country.includes('Ligue 1') ? 'France' : 'Global'}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Accordion type="multiple" defaultValue={Object.keys(leagues)} className="w-full space-y-2">
                {Object.entries(leagues).map(([league, leagueMatches]) => (
                  <AccordionItem value={league} key={league} className="border-none">
                    <AccordionTrigger className="bg-muted px-4 rounded-md hover:no-underline">
                       <div className="flex items-center gap-3">
                            <Image src={`https://picsum.photos/seed/${league.substring(0,4)}/32/32`} alt={`${league} logo`} width={24} height={24} className="rounded-full" data-ai-hint="league logo" />
                            <span className="font-semibold">{league}</span>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-1">
                      {leagueMatches.map((match) => (
                        <Link href={`/predictions/${match.id}`} key={match.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="flex w-12 flex-col items-center justify-center text-xs text-muted-foreground">
                                <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Image src={match.teamA.logo} alt={match.teamA.name} width={20} height={20} data-ai-hint="sports logo" />
                                    <span className="font-medium">{match.teamA.name}</span>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Image src={match.teamB.logo} alt={match.teamB.name} width={20} height={20} data-ai-hint="sports logo" />
                                    <span className="font-medium">{match.teamB.name}</span>
                                </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             {match.prediction && (
                               <div className="flex flex-col items-center font-mono text-sm">
                                <span>{Math.round(match.prediction.teamAWinProbability*100)}%</span>
                                <span>{Math.round(match.prediction.teamBWinProbability*100)}%</span>
                               </div>
                             )}
                            <button onClick={(e) => { e.preventDefault(); /* Handle favorite logic */ }}>
                              <Star className="h-5 w-5 text-muted-foreground/50 group-hover:text-yellow-400 transition-colors" />
                            </button>
                          </div>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
