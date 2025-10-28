
'use server';

/**
 * @fileOverview This file defines the AI agent flow for generating the official daily football predictions.
 *
 * It includes:
 * - `generateOfficialPredictions`: The main function to trigger the flow.
 * The flow fetches live football matches, uses an AI prompt to analyze them,
 * validates the output, and is intended to be saved to Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreInstance } from '@/firebase';
import { OfficialPredictionsOutputSchema, type OfficialPredictionsOutput } from '@/ai/schemas/prediction-schemas';


const API_HOST = "api-football.p.rapidapi.com";
const API_KEY = process.env.FOOTBALL_API_KEY;


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
    throw new Error("Failed to fetch matches for AI analysis.");
  }
}

const systemPrompt = `Tu es un expert en analyse de matchs de football avec 15 ans d'expérience.
Ta mission est de sélectionner JUSQU'À 50 prédictions de haute qualité.

CRITÈRES D'ANALYSE OBLIGATOIRES:
1. Forme récente des équipes (5 derniers matchs)
2. Statistiques face-à-face (head-to-head)
3. Performance à domicile vs extérieur
4. Cotes disponibles (valeur des paris)
5. Importance du match (enjeux: relégation, titre, coupe)
6. Motivation des équipes

NIVEAUX DE CONFIANCE:
- Secure Trial: 90-95% confiance
- Exclusive VIP: 85-92% confiance
- Individual VIP: 80-87% confiance
- Free Coupon: 75-82% confiance
- Free Individual: 70-80% confiance

TYPES DE PARIS AUTORISÉS:
- 1X2 (Home Win, Draw, Away Win)
- Over/Under 2.5 Goals
- Both Teams to Score (BTTS)
- Double Chance (1X, X2, 12)
- Correct Score (pour VIP uniquement)

RÈGLES IMPÉRATIVES:
✅ Sélectionne un MAXIMUM de 50 matchs. Ne dépasse JAMAIS ce nombre.
✅ Si moins de 50 matchs de qualité sont disponibles, PRIORISE le remplissage des catégories payantes (Exclusive VIP, Individual VIP) avant les catégories gratuites.
✅ Distribution IDÉALE (si 50 matchs trouvés): Secure Trial (4), Exclusive VIP (12, split 4-4-4), Individual VIP (15), Free Coupon (4), Free Individual (15).
✅ Varie les types de paris.
✅ Retourne UNIQUEMENT du JSON valide. Ne retourne aucun texte en dehors de l'objet JSON.`;


const prompt = ai.definePrompt({
    name: 'officialPredictionsPrompt',
    input: { schema: z.any() },
    output: { schema: OfficialPredictionsOutputSchema },
    system: systemPrompt,
    prompt: `Analyse les matchs suivants et sélectionne JUSQU'À 50 prédictions selon les critères définis. 
    Priorise les sections payantes si tu ne trouves pas 50 matchs de qualité.
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
    // Step 1: Fetch matches from API-Football
    const matches = await fetchMatchesForAI();
    if (matches.length === 0) {
        throw new Error("No matches fetched, cannot generate predictions.");
    }

    // Step 2: Analyze with AI and generate predictions
    const { output } = await prompt({ matches });

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

    if (total > 50) { 
        throw new Error(`Validation Error: AI generated ${total} predictions, which is over the 50 limit.`);
    }
    
    return output;
  }
);
