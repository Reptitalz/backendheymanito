
import { NextResponse } from 'next/server';

// Esta API ahora es un proxy para el gateway.
// Esto evita problemas de CORS si el cliente intenta llamar al gateway directamente.

const GATEWAY_URL = 'https://servidormanito-722319793837.europe-west1.run.app';

export async function GET() {
  try {
    const response = await fetch(`${GATEWAY_URL}/qr`);
    if (!response.ok) {
      throw new Error(`Gateway responded with status: ${response.status}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error proxying QR request to gateway:", error.message);
    return NextResponse.json({ error: 'Could not fetch QR from gateway' }, { status: 502 });
  }
}

// El POST ya no es necesario, el gateway no empuja el QR.
export async function POST(req: Request) {
    return NextResponse.json({ message: "This endpoint is deprecated. Please query the gateway's /qr endpoint via GET." }, { status: 410 });
}
