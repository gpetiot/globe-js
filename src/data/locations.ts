export interface CityData {
  coords: [number, number] // [longitude, latitude]
  background: string // Background text
  title: string // Display name
  description: string // Tooltip description
}

export const SPECIAL_LOCATIONS: Record<string, CityData> = {
  Paris: {
    coords: [2.7172, 48.0566],
    background: 'Ada',
    title: 'Paris',
    description: 'Communications-Based Train Control (CBTC)',
  },
  Grenoble: {
    coords: [5.7245, 45.1885],
    background: 'LLVM / Clang',
    title: 'Grenoble',
    description: 'Hardware Fault Injection and Simulation Research',
  },
  Manila: {
    coords: [120.9842, 14.5995],
    background: 'Tagalog',
    title: 'Manila',
    description: 'E-Learning Platform',
  },
  Cambridge: {
    coords: [0.1218, 52.2053],
    background: 'OCaml',
    title: 'Cambridge',
    description: 'Developer Tools',
  },
  Saclay: {
    coords: [1.3872, 47.5281],
    background: 'C / OCaml',
    title: 'Saclay',
    description: 'Software Verification Reasearch',
  },
}
