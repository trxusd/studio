'use server';

/**
 * @fileOverview AI-powered payment verification flow.
 *
 * - automatedPaymentVerification - A function that automates payment verification process.
 * - AutomatedPaymentVerificationInput - The input type for the automatedPaymentVerification function.
 * - AutomatedPaymentVerificationOutput - The return type for the automatedPaymentVerification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedPaymentVerificationInputSchema = z.object({
  paymentConfirmation: z.string().describe("Payment confirmation details, which could be text-based details (Email, Plan, TXID) or a data URI of a screenshot of the payment confirmation. If passing a screenshot, it should be as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  paymentMethod: z.enum(['MonCash', 'NatCash', 'Crypto', 'Visa']).describe('The payment method used.'),
  expectedAmount: z.number().describe('The expected payment amount.'),
  userId: z.string().describe('The email or ID of the user making the payment.'),
});
export type AutomatedPaymentVerificationInput = z.infer<typeof AutomatedPaymentVerificationInputSchema>;

const AutomatedPaymentVerificationOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the payment is verified.'),
  verificationDetails: z.string().describe('Details about the verification process and results.'),
});
export type AutomatedPaymentVerificationOutput = z.infer<typeof AutomatedPaymentVerificationOutputSchema>;

export async function automatedPaymentVerification(input: AutomatedPaymentVerificationInput): Promise<AutomatedPaymentVerificationOutput> {
  return automatedPaymentVerificationFlow(input);
}

const verificationPromptInputSchema = z.object({
    paymentMethod: z.string(),
    expectedAmount: z.number(),
    userId: z.string(),
    confirmationDetails: z.string().optional(),
    confirmationScreenshot: z.string().optional(),
});

const prompt = ai.definePrompt({
  name: 'automatedPaymentVerificationPrompt',
  input: {schema: verificationPromptInputSchema},
  output: {schema: AutomatedPaymentVerificationOutputSchema},
  prompt: `You are an AI assistant specialized in automatically verifying payments for the FOOTBET-WIN platform.

  Based on the provided payment confirmation details, determine if the payment is valid and matches the expected amount.
  The payment confirmation can be text details (including Email, Plan, TXID) or a screenshot.

  Payment Method: {{{paymentMethod}}}
  Expected Amount: {{{expectedAmount}}}
  User ID (Email): {{{userId}}}

  {{#if confirmationScreenshot}}
  Payment Confirmation Screenshot: {{media url=confirmationScreenshot}}
  {{/if}}
  {{#if confirmationDetails}}
  Payment Confirmation Details: {{{confirmationDetails}}}
  {{/if}}

  Your task is to analyze the provided information. If it's a screenshot, extract the transaction ID, amount, and date. If it's text, parse the details.
  Compare the found amount with the expected amount for the chosen plan.
  
  If the details are plausible and the amount seems correct, set isVerified to true and provide a summary in verificationDetails.
  If there is a mismatch, if information is missing, or if it looks suspicious, set isVerified to false. In verificationDetails, clearly state the reason for the failure (e.g., "Amount mismatch", "Transaction ID not found", "Insufficient details provided").

  Respond with a JSON object indicating whether the payment is verified and providing details about the verification process.
  `,
});

const automatedPaymentVerificationFlow = ai.defineFlow(
  {
    name: 'automatedPaymentVerificationFlow',
    inputSchema: AutomatedPaymentVerificationInputSchema,
    outputSchema: AutomatedPaymentVerificationOutputSchema,
  },
  async input => {
    const isScreenshot = input.paymentConfirmation.startsWith('data:');
    
    const promptInput = {
      paymentMethod: input.paymentMethod,
      expectedAmount: input.expectedAmount,
      userId: input.userId,
      confirmationDetails: isScreenshot ? undefined : input.paymentConfirmation,
      confirmationScreenshot: isScreenshot ? input.paymentConfirmation : undefined,
    };

    const {output} = await prompt(promptInput);
    return output!;
  }
);