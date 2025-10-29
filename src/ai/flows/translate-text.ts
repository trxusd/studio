
'use server';

/**
 * @fileOverview This file defines the AI flow for translating text.
 *
 * It includes the `translateText` function, which takes text and a target language
 * and returns the translated text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation (e.g., "English", "French", "Haitian Creole").'),
});

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});

export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextPrompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text to {{{targetLanguage}}}.
  
  Text: "{{{text}}}"

  Return ONLY the translated text.`,
});

const translateFootballPrompt = ai.definePrompt({
  name: 'translateFootballPrompt',
  input: { schema: z.object({ text: z.string() }) },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following football analysis text to French.
  Pay close attention to specific football terms like "goals", "wins", "draws", "conceded", "clean sheet", "head-to-head".
  
  Text: "{{{text}}}"

  Return ONLY the translated text.`,
});


const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async input => {
    // A little hack to improve translation quality for Haitian Creole
    if (input.targetLanguage.toLowerCase().includes('kreyòl') || input.targetLanguage.toLowerCase() === 'ht') {
        input.targetLanguage = 'Haitian Creole';
    }

    // Special prompt for French football stats
    if (input.targetLanguage.toLowerCase() === 'french' || input.targetLanguage.toLowerCase() === 'fr') {
        const { output } = await translateFootballPrompt({ text: input.text });
        return output!;
    }
    
    const { output } = await translateTextPrompt(input);
    return output!;
  }
);
