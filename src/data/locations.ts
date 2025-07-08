export interface CityData {
  coords: [number, number] // [longitude, latitude]
  title: string // Display name
  description: string // Tooltip description
}

export const SPECIAL_LOCATIONS: Record<string, CityData> = {
  Paris: {
    coords: [2.3522, 48.8566],
    title: 'Paris',
    description: 'Capital of France, center for art and technology.',
  },
  London: {
    coords: [-0.1276, 51.5074],
    title: 'London',
    description: 'Capital of the UK, global financial and tech hub.',
  },
  'New York': {
    coords: [-74.006, 40.7128],
    title: 'New York',
    description: 'Major US city, known for finance, media, and innovation.',
  },
  Tokyo: {
    coords: [139.6917, 35.6895],
    title: 'Tokyo',
    description: 'Capital of Japan, leader in technology and culture.',
  },
  'San Francisco': {
    coords: [-122.4194, 37.7749],
    title: 'San Francisco',
    description: 'Heart of Silicon Valley and tech innovation.',
  },
  Beijing: {
    coords: [116.4074, 39.9042],
    title: 'Beijing',
    description: 'Capital of China, center for politics and technology.',
  },
}
