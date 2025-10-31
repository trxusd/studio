
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
 * Genkit Tool to fetch Head-to-Head (H2H) matches between two teams.
 * The AI will call this tool to get historical data needed for its analysis.
 */
const fetchH2HMatches = ai.defineTool(
  {
    name: 'fetchH2HMatches',
    description: 'Fetches the head-to-head (H2H) match history between two teams within the last 2 years.',
    inputSchema: z.object({
      teamAId: z.number().describe('The ID of the first team.'),
      teamBId: z.number().describe('The ID of the second team.'),
    }),
    outputSchema: z.array(z.object({
        fixture_id: z.number(),
        date: z.string(),
        home_team: z.string(),
        away_team: z.string(),
        score: z.string(), // e.g., '2-1'
    })),
  },
  async ({ teamAId, teamBId }) => {
    if (!API_KEY) throw new Error("FOOTBALL_API_KEY is not configured.");
    
    const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamAId}-${teamBId}&last=10`, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST
      }
    });

    if (!response.ok) {
        console.error(`H2H API request failed: ${response.statusText}`);
        return [];
    }
    const data = await response.json();

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return data.response
        .map((match: any) => ({
            fixture_id: match.fixture.id,
            date: match.fixture.date,
            home_team: match.teams.home.name,
            away_team: match.teams.away.name,
            score: `${match.goals.home}-${match.goals.away}`,
        }))
        .filter((match: any) => new Date(match.date) >= twoYearsAgo);
  }
);


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
    const allMatches = data.response
      .slice(0, 100) // Limit to 100 matches to keep prompt reasonable
      .map((match: any) => ({
        fixture_id: match.fixture.id,
        date: match.fixture.date,
        time: match.fixture.date,
        home_team: match.teams.home.name,
        home_team_id: match.teams.home.id,
        away_team: match.teams.away.name,
        away_team_id: match.teams.away.id,
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
Ta mission est de produire une liste TRÈS SÉLECTIVE de prédictions, appelée "FBW SPECIAL". Cette liste doit contenir entre 3 et 10 prédictions MAXIMUM pour les matchs du jour.

RÈGLES D'OR (NON-NÉGOCIABLES):
1.  **Analyse H2H Obligatoire:** Pour chaque match que tu considères, tu DOIS utiliser l'outil 'fetchH2HMatches' pour obtenir l'historique des confrontations. C'est ta première étape.
2.  **Règle H2H #1:** Si l'outil 'fetchH2HMatches' retourne moins de 4 matchs, le match est IMMÉDIATEMENT disqualifié. Ignore-le.
3.  **Règle H2H #2:** Si l'outil ne retourne aucun match (zéro H2H), il est STRICTEMENT INTERDIT de faire une prédiction. Ignore le match.
4.  **Règle H2H #3 pour 'Under 2.5':** Si l'historique H2H montre des scores comme 3-0, 2-1, 1-0 ou 1-2, il est INTERDIT de prédire 'Under 2.5'. Les meilleures options sont '1X' (Double Chance), 'Victoire' (avec risque), ou 'Over 1.5'.
5.  **Qualité > Quantité:** Ne sélectionne QUE les matchs où tu as une confiance EXTRÊME (85% à 99%). Si aucun match ne respecte tes critères après analyse, retourne une liste vide.
6.  **Fixture ID Obligatoire:** Chaque prédiction DOIT inclure le 'fixture_id' correct.

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
- La valeur de "special_picks" est un tableau de tes prédictions.`;

const prompt = ai.definePrompt({
    name: 'fbwSpecialPrompt',
    tools: [fetchH2HMatches],
    input: { schema: z.object({ matches: z.array(z.any()) }) }, // Keep schema for context, but we won't require it
    output: { schema: FBWSpecialOutputSchema },
    system: systemPrompt,
    prompt: `Analyse la liste de matchs du jour. Pour chaque match, utilise l'outil 'fetchH2HMatches' et respecte SCRUPULEUSEMENT les règles d'or pour construire la liste "FBW SPECIAL".
    Produis une liste contenant entre 3 et 10 prédictions de très haute confiance.
    Si aucun match ne satisfait les critères, retourne un tableau "special_picks" vide.
    
    Matches du jour: {{{json matches}}}
    
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

    