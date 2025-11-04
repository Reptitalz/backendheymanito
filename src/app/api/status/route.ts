
import { NextResponse } from 'next/server';

// This file is no longer primarily responsible for status management.
// The frontend will now query the gateway directly.
// We'll keep this file for potential future use or proxying, but it's simplified.

export async function GET() {
  // This just confirms the frontend server itself is online.
  return NextResponse.json({ 
    frontend: 'online',
    gateway: 'unknown' // The client is responsible for fetching the gateway status
  });
}

// The POST endpoint is no longer needed as the gateway won't push status updates.
// You can remove it or leave it, it just won't be called.
export async function POST(req: Request) {
  return NextResponse.json({ message: "This endpoint is deprecated. Please query the gateway's /status endpoint directly." }, { status: 410 });
}
