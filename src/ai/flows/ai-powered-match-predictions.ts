'use server';

/**
 * @fileOverview AI-powered match predictions flow.
 *
 * - aiPoweredMatchPredictions - A function that generates football match predictions.
 * - AiPoweredMatchPredictionsInput - The input type for the aiPoweredMatchPredictions function.
 * - AiPoweredMatchPredictionsOutput - The return type for the aiPoweredMatchPredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredMatchPredictionsInputSchema = z.object({
  teamA: z.string().describe('The name of the first team.'),
  teamB: z.string().describe('The name of the second team.'),
  matchDate: z.string().describe('The date of the match.'),
});

export type AiPoweredMatchPredictionsInput = z.infer<typeof AiPoweredMatchPredictionsInputSchema>;

const AiPoweredMatchPredictionsOutputSchema = z.object({
  teamAWinProbability: z.number().describe('The probability of team A winning (0-1).'),
  teamBWinProbability: z.number().describe('The probability of team B winning (0-1).'),
  drawProbability: z.number().describe('The probability of a draw (0-1).'),
  keyStatistics: z.string().describe('Key statistics and analysis for the match.'),
  teamAAnalysis: z.string().describe('In-depth analysis of team A.'),
  teamBAnalysis: z.string().describe('In-depth analysis of team B.'),
});

export type AiPoweredMatchPredictionsOutput = z.infer<typeof AiPoweredMatchPredictionsOutputSchema>;

export async function aiPoweredMatchPredictions(input: AiPoweredMatchPredictionsInput): Promise<AiPoweredMatchPredictionsOutput> {
  return aiPoweredMatchPredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredMatchPredictionsPrompt',
  input: {schema: AiPoweredMatchPredictionsInputSchema},
  output: {schema: AiPoweredMatchPredictionsOutputSchema},
  prompt: `You are an AI expert in football match predictions.

  Analyze the match between {{teamA}} and {{teamB}} on {{matchDate}}. Provide the following:

  - Probability of Team A Winning (teamAWinProbability):
  - Probability of Team B Winning (teamBWinProbability):
  - Probability of a Draw (drawProbability):
  - Key Statistics (keyStatistics):
  - Team A Analysis (teamAAnalysis):
  - Team B Analysis (teamBAnalysis):

  Ensure the probabilities add up to 1.
  Provide detailed statistics, and analysis to back up your predictions. Focus on clear and actionable insights for betting decisions.
  `,
});

const aiPoweredMatchPredictionsFlow = ai.defineFlow(
  {
    name: 'aiPoweredMatchPredictionsFlow',
    inputSchema: AiPoweredMatchPredictionsInputSchema,
    outputSchema: AiPoweredMatchPredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
