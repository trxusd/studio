
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
export const matches: Match[] = [
    {
        id: '1144573', // Example ID, align with API if possible
        teamA: { name: 'Real Madrid', logo: 'https://media.api-sports.io/football/teams/541.png' },
        teamB: { name: 'Barcelona', logo: 'https://media.api-sports.io/football/teams/529.png' },
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        league: 'La Liga',
        prediction: {
            teamAWinProbability: 0.45,
            teamBWinProbability: 0.30,
            drawProbability: 0.25,
            keyStatistics: "Real Madrid has won 4 of the last 5 encounters. Barcelona is missing a key defender.",
            teamAAnalysis: "Real Madrid's offense is in top form, scoring an average of 2.5 goals in the last 5 games. Their midfield control will be crucial.",
            teamBAnalysis: "Barcelona's new formation shows promise but has defensive vulnerabilities. Their counter-attack is their main threat."
        }
    },
    {
        id: '1144574', // Example ID
        teamA: { name: 'Man City', logo: 'https://media.api-sports.io/football/teams/50.png' },
        teamB: { name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png' },
        date: new Date(new Date().setDate(new Date().getDate() + 1)),
        league: 'Premier League',
        prediction: {
            teamAWinProbability: 0.55,
            teamBWinProbability: 0.25,
            drawProbability: 0.20,
            keyStatistics: "Man City is undefeated at home this season. Liverpool's top scorer is returning from injury.",
            teamAAnalysis: "City's possession-based style will likely dominate the game. Expect them to control the tempo.",
            teamBAnalysis: "Liverpool's high press could disrupt City's rhythm, but they are susceptible to long balls over the top."
        }
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

export type AdminPaymentVerification = {
    id: string;
    userId: string; // email
    plan: string;
    amount: number;
    method: 'MonCash' | 'NatCash' | 'Crypto';
    transactionId: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    timestamp: string;
    screenshotUrl?: string;
};

export const adminPaymentVerifications: AdminPaymentVerification[] = [
    { id: 'verif-1', userId: 'user1@example.com', plan: 'Quarterly', amount: 10, method: 'MonCash', transactionId: 'MC-12345ABC', status: 'Pending', timestamp: '2024-07-29 10:30' },
    { id: 'verif-2', userId: 'user2@example.com', plan: 'Lifetime', amount: 100, method: 'Crypto', transactionId: '0xabc...def', status: 'Pending', timestamp: '2024-07-29 09:45' },
    { id: 'verif-3', userId: 'user3@example.com', plan: 'Monthly', amount: 5, method: 'NatCash', transactionId: 'NAT-98765XYZ', status: 'Pending', timestamp: '2024-07-28 18:00' },
    { id: 'verif-4', userId: 'user4@example.com', plan: 'Yearly', amount: 50, method: 'Crypto', transactionId: '0x123...456', status: 'Approved', timestamp: '2024-07-28 15:20' },
];
    
