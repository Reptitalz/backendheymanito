
import { NextResponse } from 'next/server';

// Store status in memory. In a real app, use a more persistent store like Redis.
let gatewayStatus: 'connected' | 'disconnected' | 'qr' | 'error' = 'disconnected';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (['connected', 'disconnected', 'qr', 'error'].includes(body.status)) {
        gatewayStatus = body.status;
        console.log(`Gateway status updated: ${gatewayStatus}`);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (error) {
    console.error("Error in /api/status POST:", error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  // The frontend status is implicitly 'online' if this endpoint is reachable.
  return NextResponse.json({ 
    frontend: 'online',
    gateway: gatewayStatus 
  });
}
