
'use server';

/**
 * @fileOverview This file defines the AI agent flow for generating the official daily football predictions.
 *
 * It includes:
 * - `generateOfficialPredictions`: The main function to trigger the flow.
 * The flow fetches live football matches, uses an AI prompt to analyze them,
 * validates the output, and is intended to be saved to Firestore.
 */
import 'dotenv/config';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { doc, writeBatch, getFirestore, serverTimestamp } from 'firebase/firestore';
import { OfficialPredictionsOutputSchema, type OfficialPredictionsOutput } from '@/ai/schemas/prediction-schemas';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';


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
 * Main exported function to run the prediction generation flow.
 * It fetches matches, runs AI analysis, validates, and saves the result.
 */
export async function generateOfficialPredictions(): Promise<OfficialPredictionsOutput> {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const firestore = getFirestore(app);

  const predictions = await generateOfficialPredictionsFlow();

  if (!predictions) {
    throw new Error("AI analysis did not return any output.");
  }
  
  // Save each category to a separate document in Firestore
  const today = new Date().toISOString().split('T')[0];
  const batch = writeBatch(firestore);

  const categoriesMap = {
    secure_trial: predictions.secure_trial?.coupon_1 || [],
    exclusive_vip_1: predictions.exclusive_vip?.coupon_1 || [],
    exclusive_vip_2: predictions.exclusive_vip?.coupon_2 || [],
    exclusive_vip_3: predictions.exclusive_vip?.coupon_3 || [],
    individual_vip: predictions.individual_vip || [],
    free_coupon: predictions.free_coupon?.coupon_1 || [],
    free_individual: predictions.free_individual || [],
  };

  for (const [key, value] of Object.entries(categoriesMap)) {
      if (value.length > 0) {
        const docRef = doc(firestore, `predictions/${today}/categories/${key}`);
        batch.set(docRef, {
            predictions: value,
            status: 'unpublished',
            category: key,
            generated_at: serverTimestamp(),
        });
      }
  }

  // Also save a master document for overview if needed
  const masterDocRef = doc(firestore, 'predictions', today);
  batch.set(masterDocRef, {
    date: today,
    metadata: {
      generated_at: serverTimestamp(),
      status: 'generated',
      api_version: 'v2.1'
    }
  }, { merge: true });
  
  await batch.commit();
  
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
        'Championship', 'Eredivisie', 'Liga Portugal', 'Copa Libertadores', 'Copa Sudamericana', 'MLS'
    ];
  
    const filteredMatches = data.response
      .filter((match: any) => majorLeagues.some(league => 
        match.league.name.includes(league) || match.league.country === 'Brazil' || match.league.country === 'Argentina'
      ))
      .slice(0, 100) // Limit to 100 matches to keep prompt reasonable
      .map((match: any) => ({
        fixture_id: match.fixture.id,
        date: match.fixture.date,
        time: match.fixture.date, // Use the full ISO string for time
        home_team: match.teams.home.name,
        home_team_id: match.teams.home.id,
        away_team: match.teams.away.name,
        away_team_id: match.teams.away.id,
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
1.  **Analyse H2H Obligatoire:** Pour chaque match, tu DOIS utiliser l'outil 'fetchH2HMatches' pour obtenir l'historique des confrontations (H2H). C'est ta première étape.
2.  Forme récente des équipes (5 derniers matchs), blessures, importance du match.
3.  Performance à domicile vs extérieur et motivation.

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
✅ Pour chaque prédiction, INCLUS OBLIGATOIREMENT le 'fixture_id' et les 'team_id' du match correspondant.
✅ Si moins de 50 matchs de qualité sont disponibles, PRIORISE le remplissage des catégories payantes (Exclusive VIP, Individual VIP) avant les catégories gratuites.
✅ Distribution IDÉALE (si 50 matchs trouvés): Secure Trial (4), Exclusive VIP (12, split 4-4-4), Individual VIP (15), Free Coupon (4), Free Individual (15).
✅ Si le nombre de matchs de qualité est faible, voici la distribution prioritaire pour les sections payantes: Exclusive VIP (12 matchs, répartis en 4-4-4), Individual VIP (5 matchs).
✅ Varie les types de paris.
✅ Retourne UNIQUEMENT du JSON valide. Ne retourne aucun texte en dehors de l'objet JSON.

RÈGLES H2H (NON-NÉGOCIABLES):
1.  **Règle #1:** Pour analyser un match, tu dois utiliser 'fetchH2HMatches'. Si l'outil retourne moins de 4 matchs, le match est IMMÉDIATEMENT disqualifié.
2.  **Règle #2:** Il est strictement interdit de faire des prédictions sur un match si l'outil ne retourne aucun match (zéro H2H).
3.  **Règle #3 pour 'Under 2.5':** Si l'historique des matchs (H2H) montre des scores comme 3-0, 2-1, 1-0 ou 1-2, il est INTERDIT de prédire 'Under 2.5'. Les meilleures options sont '1X' (Double Chance), 'Victoire' (avec risque), ou 'Over 1.5'.
`;


const prompt = ai.definePrompt({
    name: 'officialPredictionsPrompt',
    tools: [fetchH2HMatches],
    input: { schema: z.any() },
    output: { schema: OfficialPredictionsOutputSchema },
    system: systemPrompt,
    prompt: `Analyse les matchs suivants et sélectionne JUSQU'À 50 prédictions. 
    Pour chaque match, utilise l'outil 'fetchH2HMatches' et respecte SCRUPULEUSEMENT les règles H2H.
    Assure-toi d'inclure le 'fixture_id' pour chaque prédiction.
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

    
