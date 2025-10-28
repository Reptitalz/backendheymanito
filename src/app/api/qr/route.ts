
import { NextResponse } from 'next/server';

// Store QR code in memory. In a real app, use a more persistent store like Redis.
let qrCode: string | null = null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    qrCode = body.qr;
    console.log(`QR code ${qrCode ? 'updated' : 'cleared'}.`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/qr POST:", error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({ qr: qrCode });
}
