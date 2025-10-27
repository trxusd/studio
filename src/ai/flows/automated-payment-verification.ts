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
  paymentConfirmation: z.string().describe("Payment confirmation details, which could be a transaction ID, email confirmation text, or a data URI of a screenshot of the payment confirmation.  If passing a screenshot, it should be as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  paymentMethod: z.enum(['MonCash', 'Crypto', 'Visa']).describe('The payment method used.'),
  expectedAmount: z.number().describe('The expected payment amount.'),
  userId: z.string().describe('The ID of the user making the payment.'),
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

const prompt = ai.definePrompt({
  name: 'automatedPaymentVerificationPrompt',
  input: {schema: AutomatedPaymentVerificationInputSchema},
  output: {schema: AutomatedPaymentVerificationOutputSchema},
  prompt: `You are an AI assistant specialized in automatically verifying payments for the FOOTBET-WIN platform.

  Based on the provided payment confirmation details, determine if the payment is valid and matches the expected amount.  The payment confirmation can be a transaction ID, email confirmation, or a screenshot.

  Payment Method: {{{paymentMethod}}}
  Expected Amount: {{{expectedAmount}}}
  User ID: {{{userId}}}

  {{#if (startsWith paymentConfirmation "data:")}}
  Payment Confirmation Screenshot: {{media url=paymentConfirmation}}
  {{else}}
  Payment Confirmation Details: {{{paymentConfirmation}}}
  {{/if}}

  Respond with a JSON object indicating whether the payment is verified and providing details about the verification process.
  Include as much detail as possible from the payment confirmation in verificationDetails.

  Ensure that you respond in the following JSON format:
  {
  "isVerified": true/false,
  "verificationDetails": "Details about the verification, including any discrepancies or confirmations."
  }`,
});

const automatedPaymentVerificationFlow = ai.defineFlow(
  {
    name: 'automatedPaymentVerificationFlow',
    inputSchema: AutomatedPaymentVerificationInputSchema,
    outputSchema: AutomatedPaymentVerificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
