
import { NextResponse } from 'next/server';

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_HOST = "api-football.p.rapidapi.com";

async function fetchFromApi(endpoint: string, revalidate: number = 3600) {
  if (!API_KEY || !API_HOST) {
    throw new Error('API key or host is not configured.');
  }

  const response = await fetch(`https://v3.football.api-sports.io/${endpoint}`, {
    headers: {
      'x-rapidapi-host': API_HOST,
      'x-rapidapi-key': API_KEY,
    },
    next: { revalidate }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error for ${endpoint}:`, errorText);
    throw new Error(`API request failed with status: ${response.status}`);
  }
  return response.json();
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const fixtureId = searchParams.get('id');
  const live = searchParams.get('live');
  const teamSearch = searchParams.get('teamSearch');
  const teamId = searchParams.get('team');
  const teamFixtures = searchParams.get('teamFixtures');
  const squad = searchParams.get('squad');
  const standingsParam = searchParams.get('standings');

  try {
    if (fixtureId) {
      const data = await fetchFromApi(`fixtures?id=${fixtureId}`);
      return NextResponse.json({ matches: data.response });
    }
    
    if (teamSearch) {
      const data = await fetchFromApi(`teams?search=${teamSearch}`, 3600);
      return NextResponse.json({ teams: data.response });
    }
    
    if (teamId) {
        const data = await fetchFromApi(`teams?id=${teamId}`);
        return NextResponse.json({ team: data.response[0] });
    }

    if (teamFixtures) {
        const data = await fetchFromApi(`fixtures?team=${teamFixtures}&last=10&status=FT`);
        return NextResponse.json({ fixtures: data.response });
    }

    if (squad) {
        const data = await fetchFromApi(`players/squads?team=${squad}`);
        return NextResponse.json({ squad: data.response[0] });
    }
    
    if (standingsParam) {
        const [league, season] = standingsParam.split('&');
        const data = await fetchFromApi(`standings?league=${league}&season=${season}`);
        return NextResponse.json({ standings: data.response });
    }
    
    if (live) {
      const data = await fetchFromApi(`fixtures?live=${live}`, 0);
      return NextResponse.json({ matches: data.response });
    }

    // Default to fetching matches by date
    const requestDate = date || new Date().toISOString().split('T')[0];
    const data = await fetchFromApi(`fixtures?date=${requestDate}`);
    return NextResponse.json({ matches: data.response });

  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch data', error: (error as Error).message }, { status: 500 });
  }
}
