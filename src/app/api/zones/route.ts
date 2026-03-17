import { NextResponse } from 'next/server';

export async function GET() {
  const zonesByCity = {
    fes: [
      { name: "Narjiss", coords: [33.9912, -4.9945] },
      { name: "Saada", coords: [34.0205, -5.0435] },
      { name: "Route d'Imouzzer", coords: [33.9782, -5.0125] },
      { name: "Ville Nouvelle", coords: [34.0350, -5.0020] },
      { name: "Zouagha", coords: [34.0250, -5.0550] },
      { name: "Bensouda", coords: [34.0125, -5.0682] },
      { name: "Oued Fes", coords: [34.0550, -5.0150] },
      { name: "Hay Tariq", coords: [33.9995, -4.9850] },
      { name: "Agdal", coords: [34.0285, -4.9992] },
      { name: "Mellah", coords: [34.0520, -4.9915] },
      { name: "Jnan Sbil", coords: [34.0596, -4.9883] },
      { name: "Ain Nokbi", coords: [34.0410, -4.9650] },
      { name: "Hay Riad", coords: [34.0155, -5.0350] }
    ],
    casablanca: [
      { name: "Maarif", coords: [33.5700, -7.6358] },
      { name: "Anfa", coords: [33.5911, -7.6728] },
      { name: "Sidi Bernoussi", coords: [33.6050, -7.5050] },
      { name: "Ain Diab", coords: [33.5895, -7.6741] },
      { name: "Bourgogne", coords: [33.5930, -7.6450] },
      { name: "Hay Hassani", coords: [33.5464, -7.6803] },
      { name: "California", coords: [33.5385, -7.6250] }
    ],
    rabat: [
      { name: "Agdal", coords: [33.9960, -6.8480] },
      { name: "Hay Riad", coords: [33.9482, -6.8785] },
      { name: "Souissi", coords: [33.9650, -6.8350] },
      { name: "Océan", coords: [34.0220, -6.8520] }
    ],
    marrakech: [
      { name: "Gueliz", coords: [31.6324, -8.0083] },
      { name: "Hivernage", coords: [31.6210, -8.0150] },
      { name: "Medina", coords: [31.6261, -7.9894] },
      { name: "Targa", coords: [31.6580, -8.0650] }
    ],
    tangier: [
      { name: "Malabata", coords: [35.7830, -5.7850] },
      { name: "Marshan", coords: [35.7898, -5.8231] },
      { name: "Iberia", coords: [35.7725, -5.8185] },
      { name: "City Center", coords: [35.7750, -5.8100] }
    ]
  };

  return NextResponse.json(zonesByCity);
}