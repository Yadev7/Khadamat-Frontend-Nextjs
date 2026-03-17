import { NextResponse } from 'next/server';

export async function GET() {
  const cityCoordinates = {
  "fes": [34.0433, -5.0033],
  "casablanca": [33.5731, -7.5898],
  "rabat": [33.9777, -6.8374],
  "marrakech": [31.6295, -7.9811],
  "tanger": [35.7595, -5.8340],
  "agadir": [30.4278, -9.5981],
  "meknes": [33.8935, -5.5473],
  "oujda": [34.6867, -1.9114],
  "kenitra": [34.2573, -6.5890],
  "tetouan": [35.5785, -5.3684]
  };

  return NextResponse.json(cityCoordinates);
}
