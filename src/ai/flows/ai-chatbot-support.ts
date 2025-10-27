'use server';

/**
 * @fileOverview This file defines the AI chatbot support flow for the FOOTBET-WIN application.
 *
 * It includes the `aiChatbotSupport` function, which takes a user's query as input and returns a response from the AI chatbot.
 * The flow uses a Genkit prompt to generate the chatbot's response based on the provided query.
 *
 * @interface AiChatbotSupportInput - The input type for the aiChatbotSupport function.
 * @interface AiChatbotSupportOutput - The output type for the aiChatbotSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiChatbotSupportInputSchema = z.object({
  query: z.string().describe('The user query for the AI chatbot.'),
});

export type AiChatbotSupportInput = z.infer<typeof AiChatbotSupportInputSchema>;

const AiChatbotSupportOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
});

export type AiChatbotSupportOutput = z.infer<typeof AiChatbotSupportOutputSchema>;

export async function aiChatbotSupport(input: AiChatbotSupportInput): Promise<AiChatbotSupportOutput> {
  return aiChatbotSupportFlow(input);
}

const aiChatbotSupportPrompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AiChatbotSupportInputSchema},
  output: {schema: AiChatbotSupportOutputSchema},
  prompt: `You are a helpful AI chatbot for the FOOTBET-WIN platform. Your goal is to provide accurate and informative responses to user queries about the platform's features, VIP access, payment methods, and betting tips.

  Respond in a concise and clear manner, using the same language as the user's query. If the user asks about VIP access mention it gives access to premium match predictions.
  If you don't know the answer, respond that you are still under development, and cannot answer the question.
  
  User Query: {{{query}}}`,
});

const aiChatbotSupportFlow = ai.defineFlow(
  {
    name: 'aiChatbotSupportFlow',
    inputSchema: AiChatbotSupportInputSchema,
    outputSchema: AiChatbotSupportOutputSchema,
  },
  async input => {
    const {output} = await aiChatbotSupportPrompt(input);
    return output!;
  }
);
