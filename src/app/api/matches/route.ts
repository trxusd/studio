import { NextResponse } from 'next/server';

// This function now handles both fetching by date and by a specific fixture ID.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const fixtureId = searchParams.get('id');

  const apiKey = process.env.FOOTBALL_API_KEY;
  const apiHost = "api-football.p.rapidapi.com";

  if (!apiKey || !apiHost) {
    return NextResponse.json({ message: 'API key or host is not configured.' }, { status: 500 });
  }

  let apiUrl;
  if (fixtureId) {
    apiUrl = `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`;
  } else {
    const requestDate = date || new Date().toISOString().split('T')[0];
    apiUrl = `https://v3.football.api-sports.io/fixtures?date=${requestDate}`;
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 3600 } // Cache for 1 hour for date-based, less for ID-based if needed
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ message: `API request failed with status: ${response.status}`, error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ matches: data.response });

  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch matches', error: (error as Error).message }, { status: 500 });
  }
}
