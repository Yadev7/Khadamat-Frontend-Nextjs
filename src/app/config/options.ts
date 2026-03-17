// src/config/options.ts

export interface LocationOption {
  value: string;
  labelKey: string;
  coords: [number, number];
}

export interface ServiceOption {
  value: string;
  labelKey: string;
}

export const locations: LocationOption[] = [
  { value: 'casablanca', labelKey: 'casablanca', coords: [33.5731, -7.5898] },
  { value: 'marrakech', labelKey: 'marrakech', coords: [31.6295, -7.9811] },
  { value: 'rabat', labelKey: 'rabat', coords: [34.0209, -6.8417] },
  { value: 'tanger', labelKey: 'tanger', coords: [35.7595, -5.8340] },
  { value: 'fes', labelKey: 'fes', coords: [34.0181, -5.0078] },
  { value: 'agadir', labelKey: 'agadir', coords: [30.4278, -9.5981] },
  { value: 'essaouira', labelKey: 'essaouira', coords: [31.5085, -9.7595] },
  { value: 'dakhla', labelKey: 'dakhla', coords: [23.6848, -15.9575] },
  { value: 'laayoune', labelKey: 'laayoune', coords: [27.1536, -13.2033] },
];

export const services: ServiceOption[] = [
  { value: 'cleaning', labelKey: 'cleaning' },
  { value: 'plumbing', labelKey: 'plumbing' },
  { value: 'gardening', labelKey: 'gardening' },
  { value: 'electrician', labelKey: 'electrician' },
  { value: 'painting', labelKey: 'painting' },
  { value: 'carpentry', labelKey: 'carpentry' },
  { value: 'moving', labelKey: 'moving' },
  { value: 'cooking', labelKey: 'cooking' },
  { value: 'handyman', labelKey: 'handyman' },
  { value: 'babysitting', labelKey: 'babysitting' },
  { value: 'photography', labelKey: 'photography' },
  { value: 'renovation', labelKey: 'renovation' },
  { value: 'appliance_repair', labelKey: 'appliance_repair' },
  { value: 'pest_control', labelKey: 'pest_control' },
];