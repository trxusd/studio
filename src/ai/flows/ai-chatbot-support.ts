
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
1. ENFÒMASYON JENERAL / GENERAL INFORMATION / INFORMATIONS GÉNÉRALES
Kreyòl :
FOOTBET-WIN se yon aplikasyon prediksyon foutbòl ki itilize entèlijans atifisyèl (AI) pou ede w fè chwa ki pi entelijan. Aplikasyon an bay estatistik, fòm ekip yo, ak tandans match yo.
Pa gen okenn prediksyon ki garanti 100%. Itilizasyon an entèdi nan peyi kote parayj espò ilegal.
Français :
FOOTBET-WIN est une application de pronostics de football basée sur l’intelligence artificielle. Elle fournit des analyses statistiques et de forme des équipes.
Aucun résultat n’est garanti à 100 %. L’utilisation est interdite dans les pays où les paris sportifs sont illégaux.
English :
FOOTBET-WIN is a football prediction app powered by Artificial Intelligence. It provides team form analysis and statistical predictions.
No prediction is 100% guaranteed. Use is prohibited in countries where sports betting is illegal.

2. KONNEXYON & ENSKRIPSYON / LOGIN & SIGNUP / CONNEXION & INSCRIPTION
Kreyòl :
Pou kreye yon kont, antre non w, imèl oswa nimewo telefòn ou, epi chwazi yon modpas.
Si w gen pwoblèm pou konekte, verifye si w ap itilize bon modpas la oswa tcheke koneksyon entènèt ou.
Ou ka rekipere modpas ou atravè opsyon “Mot de passe oublié”.
Français :
Pour créer un compte, entrez votre nom, e-mail ou numéro de téléphone, et un mot de passe.
En cas de problème de connexion, vérifiez votre mot de passe et votre connexion Internet.
Vous pouvez réinitialiser votre mot de passe via l’option “Mot de passe oublié”.
English :
To create an account, enter your name, email or phone number, and password.
If you can’t log in, check your password or internet connection.
You can reset your password using the “Forgot password” option.

3. ABÒNMAN VIP & PEYMAN / VIP & PAYMENTS / ABONNEMENT VIP & PAIEMENTS
Kreyòl :
Pou aktive VIP, ale nan seksyon “Abònman”.
Metòd peman yo: MonCash, NatCash, Crypto (USDT TRC20).
Yon fwa peman an konfime, VIP ou aktive otomatikman.
Si gen reta, kontakte administratè a @TRX USDT.
Français :
Pour activer le VIP, allez dans la section “Abonnement”.
Moyens de paiement : MonCash, NatCash, Crypto (USDT TRC20).
Une fois le paiement confirmé, le VIP s’active automatiquement.
En cas de retard, contactez l’administrateur @TRX USDT.
English :
To activate VIP, go to the “Subscription” section.
Payment methods: MonCash, NatCash, Crypto (USDT TRC20).
Once payment is confirmed, your VIP activates automatically.
If delayed, contact admin @TRX USDT.

4. PREDIKSYON & KOUNPON / PREDICTIONS & COUPONS / PRONOSTICS & COUPONS
Kreyòl :
Seksyon “Prediksyon gratis” disponib chak jou.
VIP jwenn aksè a prediksyon espesyal, btts, over/under, double chance, elatriye.
Chak koupon gen dat ak lè aktyalizasyon.
Toujou tcheke “Rezilta ofisyèl” pou verifye prediksyon yo.
Français :
La section “Pronostics gratuits” est mise à jour chaque jour.
Les VIP ont accès à des coupons spéciaux, btts, over/under, double chance, etc.
Chaque coupon affiche la date et l’heure de mise à jour.
Vérifiez toujours les “Résultats officiels”.
English :
The “Free Predictions” section updates daily.
VIP users get special coupons, btts, over/under, double chance, etc.
Each coupon shows update time and date.
Always check the “Official Results” section.

5. ERÈ TEKNIK / TECHNICAL ISSUES / PROBLÈMES TECHNIQUES
Kreyòl :
Si app la pa ouvè, efase cache oswa reenkstale aplikasyon an.
Asire w ke ou gen dènye vèsyon an.
Si w pèdi done VIP ou, kontakte sipò.
Français :
Si l’application ne s’ouvre pas, videz le cache ou réinstallez-la.
Assurez-vous d’avoir la dernière version.
En cas de perte d’accès VIP, contactez le support.
English :
If the app doesn’t open, clear cache or reinstall.
Make sure you have the latest version.
If VIP data is lost, contact support.

6. KONTAK ADMIN / CONTACT ADMIN / CONTACT ADMINISTRATEUR
Kreyòl :
Pou nenpòt pwoblèm teknik oswa peman, kontakte administratè prensipal la sou Telegram oswa nan kominote a: @TRX USDT
Français :
Pour toute question technique ou de paiement, contactez l’administrateur principal via Telegram ou la communauté : @TRX USDT
English :
For any technical or payment issues, contact the main admin via Telegram or the community: @TRX USDT

7. RÈG KOMINOTE / COMMUNITY RULES / RÈGLES DE LA COMMUNAUTÉ
Kreyòl :
Pa pataje fo enfòmasyon oswa spam.
Rete respekte tout manm.
Pa pibliye koupon VIP piblikman.
Nenpòt vyolasyon ka lakoz suspansyon.
Français :
Ne partagez pas de fausses informations ni de spam.
Restez respectueux envers tous les membres.
Ne publiez pas de coupons VIP publiquement.
Toute violation peut entraîner une suspension.
English :
Do not share fake info or spam.
Stay respectful toward all members.
Do not publish VIP coupons publicly.
Any violation may result in suspension.

8. KONSEY PARAYJ RESPONSAB / RESPONSIBLE BETTING TIPS / JEUX RESPONSABLES
Kreyòl :
Parye sèlman ak lajan ou kapab pèdi.
Pa chache refè pèt ou yo touswit.
Kenbe disiplin ak yon plan parayj.
Analize, pa jwe emosyonèlman.
Français :
Pariez uniquement ce que vous pouvez vous permettre de perdre.
Ne cherchez pas à rattraper vos pertes immédiatement.
Gardez discipline et stratégie.
Analysez avant de parier.
English :
Bet only what you can afford to lose.
Don’t chase your losses.
Stay disciplined and strategic.
Analyze, don’t play emotionally.

9. LÒT ENFÒMASYON / OTHER INFORMATION / AUTRES INFORMATIONS
Kreyòl :
Sit ofisyèl: https://footbet-win.com
Versyon aktyèl: v3.5.2
Sistèm AI: FOOTBETWIN-AI ENGINE 2.0
Français :
Site officiel : https://footbet-win.com
Version actuelle : v3.5.2
Moteur IA : FOOTBETWIN-AI ENGINE 2.0
English :
Official site: https://footbet-win.com
Current version: v3.5.2
AI Engine: FOOTBETWIN-AI ENGINE 2.0
`;

const aiChatbotSupportPrompt = ai.definePrompt({
  name: 'aiChatbotSupportPrompt',
  input: {schema: AiChatbotSupportInputSchema},
  output: {schema: AiChatbotSupportOutputSchema},
  system: `You are the Official Support Assistant for the FOOTBET-WIN application. Your mission is to provide clear, quick, and accurate help to users about the FOOTBET-WIN app, in the language they use (French, English, or Haitian Creole).

  Respond in a concise and clear manner, using the same language as the user's query.
  If you don't know the answer or the information is not in the knowledge base, respond: "I don't have information on this topic yet. The FOOTBET-WIN team will get back to you soon." Do not make up information.
  Always maintain a professional and friendly tone.

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
