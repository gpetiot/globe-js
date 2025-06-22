export interface CityData {
  coords: [number, number] // [longitude, latitude]
  title: string // Display name
  description: string // Tooltip description
}

export const SPECIAL_LOCATIONS: Record<string, CityData> = {
  Paris: {
    coords: [2.7172, 48.0566],
    title: 'Paris',
    description: 'Communications-Based Train Control (CBTC)',
  },
  Grenoble: {
    coords: [5.7245, 45.1885],
    title: 'Grenoble',
    description: 'Hardware Fault Injection and Simulation Research',
  },
  Manila: {
    coords: [120.9842, 14.5995],
    title: 'Manila',
    description: 'E-Learning Platform',
  },
  Cambridge: {
    coords: [0.1218, 52.2053],
    title: 'Cambridge',
    description: 'Developer Tools',
  },
  Saclay: {
    coords: [1.3872, 47.5281],
    title: 'Saclay',
    description: 'Software Verification Reasearch',
  },
}
