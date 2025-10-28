'use server';

/**
 * @fileOverview This file defines the AI agent flow for generating the official daily football predictions.
 *
 * It includes:
 * - `generateOfficialPredictions`: The main function to trigger the flow.
 * - `OfficialPredictionsOutput`: The Zod schema and type for the structured prediction data.
 * The flow fetches live football matches, uses an AI prompt to analyze them,
 * validates the output, and is intended to be saved to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase';

const API_HOST = "api-football.p.rapidapi.com";
const API_KEY = process.env.FOOTBALL_API_KEY;

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

/**
 * Main exported function to run the prediction generation flow.
 * It fetches matches, runs AI analysis, validates, and saves the result.
 */
export async function generateOfficialPredictions(): Promise<OfficialPredictionsOutput> {
  const firestore = getFirestoreInstance();
  const predictions = await generateOfficialPredictionsFlow();

  // Save to Firestore
  const today = new Date().toISOString().split('T')[0];
  const predictionDocRef = doc(firestore, 'predictions', today);
  
  const predictionData = {
    date: today,
    predictions: predictions,
    metadata: {
      generated_at: new Date().toISOString(),
      total_predictions: 50,
      status: 'published',
      api_version: 'v2.0'
    }
  };
  
  await setDoc(predictionDocRef, predictionData);
  
  return predictions;
}

// Internal function to fetch matches for today
async function fetchMatchesForAI() {
  if (!API_KEY) {
    throw new Error("FOOTBALL_API_KEY is not configured.");
  }
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}&status=NS`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    if (!response.ok) {
        throw new Error(`API-Football request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const majorLeagues = [
        'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 
        'Ligue 1', 'Champions League', 'Europa League', 
        'Championship', 'Eredivisie', 'Liga Portugal'
    ];
  
    const filteredMatches = data.response
      .filter((match: any) => majorLeagues.some(league => 
        match.league.name.includes(league)
      ))
      .slice(0, 100) // Limit to 100 matches to keep prompt reasonable
      .map((match: any) => ({
        fixture_id: match.fixture.id,
        date: match.fixture.date,
        time: new Date(match.fixture.date).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        home_team: match.teams.home.name,
        away_team: match.teams.away.name,
        league: match.league.name,
        country: match.league.country,
        venue: match.fixture.venue.name
      }));
      
    return filteredMatches;

  } catch (error) {
    console.error("Error fetching matches from API-Football:", error);
    throw new Error("Failed to fetch matches for AI analysis.");
  }
}

const systemPrompt = `Tu es un expert en analyse de matchs de football avec 15 ans d'expérience. 
Ta mission est d'analyser les matchs fournis et de sélectionner EXACTEMENT 50 prédictions.

CRITÈRES D'ANALYSE OBLIGATOIRES:
1. Forme récente des équipes (5 derniers matchs)
2. Statistiques face-à-face (head-to-head)
3. Performance à domicile vs extérieur
4. Cotes disponibles (valeur des paris)
5. Importance du match (enjeux: relégation, titre, coupe)
6. Motivation des équipes

NIVEAUX DE CONFIANCE:
- Secure Trial: 90-95% confiance (matchs les plus sûrs)
- Exclusive VIP: 85-92% confiance (très forte probabilité)
- Individual VIP: 80-87% confiance (bonne probabilité)
- Free Coupon: 75-82% confiance (solide)
- Free Individual: 70-80% confiance (correct)

TYPES DE PARIS AUTORISÉS:
- 1X2 (Home Win, Draw, Away Win)
- Over/Under 2.5 Goals
- Both Teams to Score (BTTS)
- Double Chance (1X, X2, 12)
- Correct Score (pour VIP uniquement)

RÈGLES IMPÉRATIVES:
✅ Sélectionne EXACTEMENT 50 matchs (max)
✅ Distribution: Secure Trial (4), Exclusive VIP (12, split into 3 coupons of 4), Individual VIP (15), Free Coupon (4), Free Individual (15)
✅ Priorise les ligues majeures
✅ Varie les types de paris pour diversifier
✅ Retourne UNIQUEMENT du JSON valide. Ne retourne aucun texte ou markdown en dehors de l'objet JSON.`;


const prompt = ai.definePrompt({
    name: 'officialPredictionsPrompt',
    input: { schema: z.any() },
    output: { schema: OfficialPredictionsOutputSchema },
    system: systemPrompt,
    prompt: `Analyse les matchs suivants et sélectionne EXACTEMENT 50 prédictions selon les critères définis. 
    Retourne UNIQUEMENT le JSON structuré sans texte additionnel:

    Matches: {{{json matches}}}`,
});

const generateOfficialPredictionsFlow = ai.defineFlow(
  {
    name: 'generateOfficialPredictionsFlow',
    inputSchema: z.void(),
    outputSchema: OfficialPredictionsOutputSchema,
  },
  async () => {
    console.log('🚀 Starting Football Predictions Generation...');
    
    // Step 1: Fetch matches from API-Football
    const matches = await fetchMatchesForAI();
    console.log(`✅ Fetched ${matches.length} matches`);
    if (matches.length === 0) {
        throw new Error("No matches fetched, cannot generate predictions.");
    }

    // Step 2: Analyze with AI and generate predictions
    const { output } = await prompt({ matches });
    console.log('✅ AI Analysis completed');

    if (!output) {
      throw new Error("AI analysis did not return any output.");
    }
    
    // Step 3: Validate predictions
    const counts = {
        secure_trial: output.secure_trial?.coupon_1?.length || 0,
        exclusive_vip_1: output.exclusive_vip?.coupon_1?.length || 0,
        exclusive_vip_2: output.exclusive_vip?.coupon_2?.length || 0,
        exclusive_vip_3: output.exclusive_vip?.coupon_3?.length || 0,
        individual_vip: output.individual_vip?.length || 0,
        free_coupon: output.free_coupon?.coupon_1?.length || 0,
        free_individual: output.free_individual?.length || 0
    };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    if (total < 45 || total > 55) { // Allow some flexibility
        console.warn(`Validation Warning: Generated ${total} predictions instead of 50. Distribution: ${JSON.stringify(counts)}`);
    } else {
        console.log('✅ Predictions count is within the acceptable range.');
    }
    
    return output;
  }
);
