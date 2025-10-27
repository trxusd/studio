import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  const apiHost = process.env.NEXT_PUBLIC_RAPIDAPI_HOST;

  if (!apiKey || !apiHost) {
    return NextResponse.json({ message: 'API key or host is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://${apiHost}/v3/fixtures?date=${date}`, {
      headers: {
        'x-rapidapi-host': apiHost,
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json({ message: `API request failed with status: ${response.status}`, error: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ matches: data.response });

  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json({ message: 'Failed to fetch matches', error: (error as Error).message }, { status: 500 });
  }
}
