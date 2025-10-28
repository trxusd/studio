
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

const KNOWLEDGE_BASE = `
1. Enfòmasyon sou Aplikasyon an
- Non aplikasyon an: FOOTBET-WIN.
- Fonksyon prensipal: bay prediksyon foutbòl avèk analiz avanse, epi ede itilizatè pran pi bon desizyon nan parye yo.
- Seksyon prensipal yo:
  - Paj prensipal: montre dènye prediksyon, estatistik, ak rezilta yo.
  - VIP: se zòn espesyal kote sèlman abònen jwenn prediksyon ki gen plis fyab, ak rapò detaye.
  - Peman: kote itilizatè yo ka peye plan VIP yo.
  - Kominote: espas chat kote manm yo ka fè deba, poze kesyon, epi pataje opinyon.
- Mizajou: chak nouvo vèsyon pote amelyorasyon (egzanp: plis endikatè analiz, plis opsyon peman, amelyorasyon sekirite).

2. Itilizasyon VIP
- Kisa VIP ye? Yon sèvis espesyal ki ouvri pòt pou prediksyon pwofesyonèl ki gen plis konfyans.
- Pri abònman yo:
  - Vip1/semèn: 5$
  - Vip2/mwa : 15$
  - Vip3/6mwa: 70$
  - Vip4/anyèl: 100$
- Avantaj VIP yo:
  - Prediksyon ak yon nivo fyab ki pi wo.
  - Notifikasyon rapid sou telefòn ou (push alerts).
  - Rapò detaye ak estatistik analiz pou chak match.
- Periòd gratis: nouvo itilizatè yo ka jwi yon peryòd tès gratis anvan yo pran abònman VIP.

3. Peman
- Mwayen aksepte:
  - MonCash: 37471410
  - NatCash: 40050381
  - Crypto (USDT)
  - Kat Visa / MasterCard
- Etap pou peye:
  1. Ale nan seksyon "Peman".
  2. Chwazi metòd ou vle.
  3. Antre montan / konfime.
  4. Resevwa konfimasyon sou app la.
- Tan pwosesis: pifò tranzaksyon yo trete an mwens ke 5 minit.
- Verifikasyon: apre peman, estati abònman ou vin VIP otomatikman.

4. Prediksyon & Analiz
- Ki jan pou li prediksyon yo: chak match gen siy (1 = lakay, X = egal, 2 = deplasman) ak yon pousantaj fyab.
- Analiz la: gen done sou fòm ekip yo, estatistik (gòl, defans, viktwa).
- Risk nan parye: okenn prediksyon pa garanti 100%, gen toujou risk pèdi.
- Règleman: pran prediksyon yo kòm gid, pa kòm verite absoli.

5. Konsèy sou Pari Responsab
- Jesyon risk: toujou mete yon bidjè fiks pou parye.
- Limit pèdi: pa janm parye plis pase sa ou ka pèdi san pwoblèm.
- Disiplin: pa kite emosyon gide ou, swiv estrateji ou.
- Analiz: li done yo, pa suiv sèlman santiman ou.
- Regilarite: pi bon se fè ti parye regilye olye de gwo parye emosyonèl.

6. Kominote & Règleman
- Chat kominote: kote manm yo diskite sou prediksyon, pataje opinyon.
- Règleman:
  - Pa joure lòt manm.
  - Pa fè spam ni piblisite pèsonèl.
  - Kenbe respè pou tout moun.
- Sanksyon:
  - Premye fwa: avètisman.
  - Repete: blokaj tanporè.
  - Twòp vyolasyon: eksklizyon pèmanan.

7. Pwoblèm & Rezolisyon
- Pwoblèm komen:
  - Pa ka konekte: tcheke koneksyon entènèt / reset modpas.
  - Peman pa verifye: asire ou fin resevwa resi tranzaksyon an, tann kèk minit.
  - Erè afichaj: fè yon mizajou app la.
- Etap debaz pou rezoud:
  1. Fè logout epi relogin.
  2. Reyinisyalize koneksyon entènèt ou.
  3. Reyinstale app la si nesesè.
- Kontakte sipò: sèlman atravè seksyon sipò nan aplikasyon an (footbetwin2025@gmail.com).
`;

const aiChatbotSupportPrompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AiChatbotSupportInputSchema},
  output: {schema: AiChatbotSupportOutputSchema},
  system: `You are a helpful AI chatbot for the FOOTBET-WIN platform. Your goal is to provide accurate and informative responses to user queries based ONLY on the knowledge base provided below.

  Respond in a concise and clear manner, using the same language as the user's query (Haitian Creole, French, English, or Spanish).
  If you don't know the answer or the information is not in the knowledge base, respond that you are still under development and cannot answer the question. Do not make up information.

  --- KNOWLEDGE BASE ---
  ${KNOWLEDGE_BASE}
  --- END KNOWLEDGE BASE ---
  `,
  prompt: `User Query: {{{query}}}`,
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
