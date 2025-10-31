
'use server';

/**
 * @fileOverview This file defines the AI agent flow for generating the "FBW SPECIAL" elite predictions.
 *
 * It includes:
 * - `generateFBWSpecialPredictions`: The main function to trigger the flow.
 * The flow fetches live football matches, uses an AI prompt with very strict rules to analyze them,
 * and saves the result to a specific Firestore document.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, writeBatch, getFirestore, serverTimestamp } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Define the schema for a single special pick
const SpecialPickSchema = z.object({
    fixture_id: z.number().describe("The unique ID of the match fixture."),
    match: z.string().describe("The full match description, e.g., 'Team A vs Team B'."),
    home_team: z.string().describe("The name of the home team."),
    away_team: z.string().describe("The name of the away team."),
    league: z.string().describe("The name of the league."),
    time: z.string().describe("The start time of the match."),
    prediction: z.string().describe("The betting prediction, e.g., '1 (Home Win)', 'Over 1.5'."),
    odds: z.number().describe("The decimal odds for the prediction."),
    confidence: z.number().min(85).max(99).describe("The confidence level of the prediction, from 85 to 99."),
    status: z.enum(['Win', 'Loss', 'Pending']).optional().describe("The outcome of the prediction. Default is 'Pending'."),
    finalScore: z.string().optional().describe("The final score of the match, e.g., '2-1'.")
});

// Define the output schema for the entire flow
const FBWSpecialOutputSchema = z.object({
  special_picks: z.array(SpecialPickSchema).describe("A curated list of elite football match predictions based on strict criteria."),
});

export type FBWSpecialOutput = z.infer<typeof FBWSpecialOutputSchema>;

const API_HOST = "api-football.p.rapidapi.com";
const API_KEY = process.env.FOOTBALL_API_KEY;

/**
 * Main exported function to run the FBW Special prediction generation flow.
 * It fetches matches, runs AI analysis, and saves the result.
 */
export async function generateFBWSpecialPredictions(): Promise<FBWSpecialOutput> {
  const predictions = await fbwSpecialPredictionsFlow();

  if (!predictions) {
    throw new Error("AI analysis for FBW Special did not return any output.");
  }
  
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const firestore = getFirestore(app);

  const today = new Date().toISOString().split('T')[0];
  const batch = writeBatch(firestore);

  // Save the single list of special picks to a dedicated document
  const docRef = doc(firestore, `predictions/${today}/categories/fbw_special`);
  batch.set(docRef, {
      predictions: predictions.special_picks,
      status: 'unpublished',
      category: 'fbw_special',
      generated_at: serverTimestamp(),
  });
  
  // Update the master document as well
  const masterDocRef = doc(firestore, 'predictions', today);
  batch.set(masterDocRef, {
    date: today,
    metadata: {
      fbw_special_generated_at: serverTimestamp(),
    }
  }, { merge: true });
  
  await batch.commit();
  
  return predictions;
}

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
    
    // Analyze all matches to find the best picks based on strict criteria.
    // No pre-filtering by league.
    const allMatches = data.response
      .map((match: any) => ({
        fixture_id: match.fixture.id,
        date: match.fixture.date,
        time: match.fixture.date,
        home_team: match.teams.home.name,
        away_team: match.teams.away.name,
        league: match.league.name,
        country: match.league.country,
        venue: match.fixture.venue.name
      }));
      
    return allMatches;

  } catch (error) {
    console.error("Failed to fetch matches for AI analysis:", error)
    throw new Error("Failed to fetch matches for AI analysis.");
  }
}

const systemPrompt = `Tu es un analyste de paris sportifs d'élite, connu pour ta précision chirurgicale et ta discipline de fer.
Ta mission est de produire une liste TRÈS SÉLECTIVE de prédictions, appelée "FBW SPECIAL". Cette liste doit contenir entre 3 et 10 prédictions MAXIMUM.

RÈGLES D'OR (NON-NÉGOCIABLES):
1.  **Règle H2H #1:** Pour analyser un match, il doit y avoir un minimum de 4 matchs en tête-à-tête (H2H), et ces matchs ne doivent pas dater de plus de 2 ans.
2.  **Règle H2H #2:** Il est STRICTEMENT INTERDIT de faire des prédictions sur un match si les deux équipes ne se sont jamais affrontées.
3.  **Règle H2H #3 pour 'Under 2.5':** Si l'historique des matchs (H2H) montre des scores comme 3-0, 2-1, 1-0 ou 1-2, il est INTERDIT de prédire 'Under 2.5'. Les meilleures options sont '1X' (Double Chance), 'Victoire' (avec risque), ou 'Over 1.5'.
4.  **Qualité > Quantité:** Ne sélectionne QUE les matchs où tu as une confiance EXTRÊME (85% à 99%). Si aucun match ne respecte tes critères, retourne une liste vide.
5.  **Fixture ID Obligatoire:** Chaque prédiction DOIT inclure le 'fixture_id'.

CRITÈRES D'ANALYSE ADDITIONNELS:
- Forme récente (5 derniers matchs), blessures clés, importance du match.
- Performance à domicile/extérieur.

TYPES DE PARIS AUTORISÉS:
- 1X2 (Home Win, Draw, Away Win)
- Over/Under (sauf les restrictions de la règle #3)
- Both Teams to Score (BTTS)
- Double Chance (1X, X2, 12)

FORMAT DE SORTIE:
- Retourne UNIQUEMENT un objet JSON valide avec une seule clé: "special_picks".
- La valeur de "special_picks" est un tableau de tes prédictions.
`;

const prompt = ai.definePrompt({
    name: 'fbwSpecialPrompt',
    input: { schema: z.any() },
    output: { schema: FBWSpecialOutputSchema },
    system: systemPrompt,
    prompt: `Analyse les matchs suivants en respectant SCRUPULEUSEMENT les règles d'or.
    Produis la liste "FBW SPECIAL" contenant entre 3 et 10 prédictions de très haute confiance.
    Si aucun match ne satisfait les critères, retourne un tableau "special_picks" vide.
    
    Matches: {{{json matches}}}
    
    Retourne UNIQUEMENT le JSON structuré.`,
});

const fbwSpecialPredictionsFlow = ai.defineFlow(
  {
    name: 'fbwSpecialPredictionsFlow',
    inputSchema: z.void(),
    outputSchema: FBWSpecialOutputSchema,
  },
  async () => {
    const matches = await fetchMatchesForAI();
    if (matches.length === 0) {
        console.log("No matches fetched, returning empty list.");
        return { special_picks: [] };
    }

    const { output } = await prompt({ matches });

    if (!output) {
      throw new Error("FBW Special AI analysis did not return any output.");
    }
    
    if (output.special_picks.length > 10) {
        throw new Error(`Validation Error: AI generated ${output.special_picks.length} special picks, which is over the 10 limit.`);
    }
    
    return output;
  }
);
