

import type { MatchPrediction } from "@/ai/schemas/prediction-schemas";
import type { AiPoweredMatchPredictionsOutput } from "@/ai/flows/ai-powered-match-predictions";

// This type is now mainly for the static fallback data and can be removed
// if the API is the single source of truth.
export type Match = {
    id: string;
    teamA: { name: string; logo: string };
    teamB: { name: string; logo: string };
    date: Date;
    league: string;
    prediction?: AiPoweredMatchPredictionsOutput;
};

// This static data is no longer used by the main matches page,
// but can be kept for other parts of the app or as a fallback.
export const matches: MatchPrediction[] = [
    {
        fixture_id: 1144573, // Example ID, align with API if possible
        home_team: 'Real Madrid',
        away_team: 'Barcelona',
        time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        league: 'La Liga',
        prediction: "Real Madrid to Win",
        odds: 2.1,
        confidence: 85,
        match: 'Real Madrid vs Barcelona'
    },
    {
        fixture_id: 1144574, // Example ID
        home_team: 'Man City',
        away_team: 'Liverpool',
        time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        league: 'Premier League',
        prediction: "Over 2.5 Goals",
        odds: 1.8,
        confidence: 90,
        match: 'Man City vs Liverpool'
    },
];

export type CommunityPost = {
    id: string;
    user: { name: string; avatar: string };
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
};

export const communityPosts: CommunityPost[] = [
    {
        id: 'post-1',
        user: { name: 'BetMasterFlex', avatar: 'https://picsum.photos/seed/user1/40/40' },
        timestamp: '2 hours ago',
        content: "I'm putting my money on Real Madrid for El Clásico. Their current form is just too good. What do you all think?",
        likes: 15,
        comments: 4,
    },
    {
        id: 'post-2',
        user: { name: 'SoccerSavvy', avatar: 'https://picsum.photos/seed/user2/40/40' },
        timestamp: '5 hours ago',
        content: "Don't sleep on Liverpool. Their attack is finally clicking again. I see an upset coming against Man City.",
        likes: 8,
        comments: 2,
    },
];

export type AdminUser = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Inactive';
    plan: string;
    joinedDate: string;
}

export const adminUsers: AdminUser[] = [
    { id: 'user-1', name: 'John Doe', email: 'john@example.com', status: 'Active', plan: 'Yearly VIP', joinedDate: '2023-01-15' },
    { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', status: 'Active', plan: 'Monthly VIP', joinedDate: '2023-06-10' },
    { id: 'user-3', name: 'Mike Johnson', email: 'mike@example.com', status: 'Inactive', plan: 'Expired', joinedDate: '2022-11-20' },
];

export type AdminCoupon = {
    id: string;
    code: string;
    discount: string;
    status: 'Active' | 'Expired';
    uses: string;
    expires: string;
};

export const adminCoupons: AdminCoupon[] = [
    { id: 'coupon-1', code: 'SUMMER2024', discount: '20% Off', status: 'Active', uses: '152/1000', expires: '2024-08-31' },
    { id: 'coupon-2', code: 'VIPNEW', discount: '$10 Off First Month', status: 'Active', uses: '312/2000', expires: '2024-12-31' },
    { id: 'coupon-3', code: 'SPRING2024', discount: '15% Off', status: 'Expired', uses: '500/500', expires: '2024-05-31' },
];

// This static data is no longer used and can be removed.
export const adminPaymentVerifications: any[] = [];


export type PastPrediction = {
    id: string;
    teamA: { name: string; };
    teamB: { name: string; };
    league: string;
    prediction: string;
    finalScore: string;
};

export const pastPredictions: PastPrediction[] = [
    { id: 'res-1', teamA: { name: 'Real Madrid' }, teamB: { name: 'Barcelona' }, league: 'La Liga', prediction: '1 (Real Madrid)', finalScore: '3-1', },
    { id: 'res-2', teamA: { name: 'Man City' }, teamB: { name: 'Liverpool' }, league: 'Premier League', prediction: 'Over 2.5', finalScore: '2-2', },
    { id: 'res-3', teamA: { name: 'Juventus' }, teamB: { name: 'Inter Milan' }, league: 'Serie A', prediction: 'X (Draw)', finalScore: '0-1', },
    { id: 'res-4', teamA: { name: 'Bayern Munich' }, teamB: { name: 'Dortmund' }, league: 'Bundesliga', prediction: 'Under 3.5', finalScore: '4-0', },
    { id: 'res-5', teamA: { name: 'PSG' }, teamB: { name: 'Marseille' }, league: 'Ligue 1', prediction: 'PSG to win', finalScore: '2-0', },
    { id: 'res-6', teamA: { name: 'Chelsea' }, teamB: { name: 'Arsenal' }, league: 'Premier League', prediction: 'Draw', finalScore: '2-2', },
];
    

    
