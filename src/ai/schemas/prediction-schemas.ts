import { z } from 'zod';

const MatchPredictionSchema = z.object({
    match: z.string().describe("The full match description, e.g., 'Team A vs Team B'."),
    home_team: z.string().describe("The name of the home team."),
    away_team: z.string().describe("The name of the away team."),
    league: z.string().describe("The name of the league."),
    time: z.string().describe("The start time of the match."),
    prediction: z.string().describe("The betting prediction, e.g., '1 (Home Win)', 'Over 2.5'."),
    odds: z.number().describe("The decimal odds for the prediction."),
    confidence: z.number().min(70).max(95).describe("The confidence level of the prediction, from 70 to 95."),
});

const CouponSchema = z.array(MatchPredictionSchema);

export const OfficialPredictionsOutputSchema = z.object({
  secure_trial: z.object({
    coupon_1: CouponSchema,
  }),
  exclusive_vip: z.object({
    coupon_1: CouponSchema,
    coupon_2: CouponSchema,
    coupon_3: CouponSchema,
  }),
  individual_vip: CouponSchema,
  free_coupon: z.object({
    coupon_1: CouponSchema,
  }),
  free_individual: CouponSchema,
});

export type OfficialPredictionsOutput = z.infer<typeof OfficialPredictionsOutputSchema>;
