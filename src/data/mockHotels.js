/**
 * Fictional City Hotel Base-Camps (Aethelgard Bay)
 * Exactly 10 hotels with whole-number complete stay costs in INR (₹) (1 to 1,000,000).
 * IDs conform to ^[A-Z][A-Z0-9_-]{0,15}$
 */
export const MOCK_HOTELS = [
  {
    id: 'H01_PALACE',
    name: 'Grand Palace Imperial',
    stay_cost: 14500,
    district: 'Royal Citadel Bastion',
    style: 'Heritage Luxury',
    rating: 4.9,
    reviewsCount: 2420,
    coordinates: { x: 490, y: 150 },
    description: 'Opulent royal lodging adjacent to the Citadel; premier access but exceeds initial budget of ₹12,000.',
    amenities: ['Imperial Concierge', 'Valet Transit', 'Rooftop Lounge', 'Fine Dining']
  },
  {
    id: 'H02_METRO',
    name: 'Central Metro Base-Camp',
    stay_cost: 10500,
    district: 'Central Interchange',
    style: 'Transit Hub Hotel',
    rating: 4.6,
    reviewsCount: 1840,
    coordinates: { x: 470, y: 340 },
    description: 'High-speed transit hub hotel directly above Central Junction; all round trips are under 55 minutes.',
    amenities: ['Direct Metro Access', 'Express Check-in', 'Soundproof Pods', 'Grab & Go']
  },
  {
    id: 'H03_CANAL',
    name: 'Verdant Canal Boutique',
    stay_cost: 9800,
    district: 'Midtown River Canal',
    style: 'Boutique Riverside',
    rating: 4.7,
    reviewsCount: 1120,
    coordinates: { x: 380, y: 410 },
    description: 'Charming boutique hotel along the willow-lined canal; exceptional proximity to the Old Port Night Market.',
    amenities: ['Canal Waterway Dock', 'Artisan Espresso Bar', 'Bicycle Fleet', 'Quiet Courtyard']
  },
  {
    id: 'H04_OLDTOWN',
    name: 'Old Citadel Heritage Inn',
    stay_cost: 11500,
    district: 'Historic Artisan Quarter',
    style: 'Cozy Historic',
    rating: 4.5,
    reviewsCount: 960,
    coordinates: { x: 370, y: 220 },
    description: 'Timber-beamed historic inn nestled in cobblestone alleys, walking distance to bakeries and monuments.',
    amenities: ['Artisan Bakery Breakfast', 'Walking Tours', 'Historic Library', 'Garden Patio']
  },
  {
    id: 'H05_NOMAD',
    name: 'Portside Nomad Hostel',
    stay_cost: 8200,
    district: 'South Industrial Basin',
    style: 'Social Budget',
    rating: 4.2,
    reviewsCount: 1580,
    coordinates: { x: 230, y: 490 },
    description: 'Vibrant budget basecamp; lowest price in the city, but requires longer cross-town transit exceeding 90 min.',
    amenities: ['Communal Kitchen', 'Bouldering Wall', 'Game Lounge', 'Laundry Hub']
  },
  {
    id: 'H06_RIVER',
    name: 'Meridian Riverside Lodge',
    stay_cost: 12000,
    district: 'River Promenade East',
    style: 'Modern Scenic',
    rating: 4.6,
    reviewsCount: 880,
    coordinates: { x: 570, y: 390 },
    description: 'Waterside lodge directly on the eastern boardwalk; stay cost exactly equals initial lodging budget of ₹12,000.',
    amenities: ['Riverfront Terrace', 'Ferry Berth', 'Fitness Room', 'Evening Jazz']
  },
  {
    id: 'H07_HARBOR',
    name: 'Harborview Point Suites',
    stay_cost: 13500,
    district: 'Marina Promenade',
    style: 'Coastal Maritime',
    rating: 4.8,
    reviewsCount: 1310,
    coordinates: { x: 190, y: 310 },
    description: 'Sweeping maritime views over the deep-water harbor and seafood wharfs; over initial budget by ₹1,500.',
    amenities: ['Harbor Shuttle', 'Spa & Wellness', 'Seafood Terrace', 'Sailing Dock']
  },
  {
    id: 'H08_GARDEN',
    name: 'Canopy Botanical Resort',
    stay_cost: 16000,
    district: 'Eastern Foothills',
    style: 'Eco Serenity',
    rating: 4.7,
    reviewsCount: 750,
    coordinates: { x: 790, y: 190 },
    description: 'Tranquil sanctuary in the terraced botanical biomes; quiet retreat but requires longer urban travel times.',
    amenities: ['Organic Dining', 'Yoga Pavilion', 'Nature Trails', 'EV Charging']
  },
  {
    id: 'H09_FINANCE',
    name: 'Pinnacle Financial Tower',
    stay_cost: 18000,
    district: 'Financial & FinTech Center',
    style: 'Modern Executive',
    rating: 4.7,
    reviewsCount: 1040,
    coordinates: { x: 640, y: 270 },
    description: 'Sleek glass tower suites in the central business district with panoramic city skyline terraces.',
    amenities: ['Infinity Sky Pool', 'Co-working Pods', 'Fitness Center', 'Cocktail Lounge']
  },
  {
    id: 'H10_STRAND',
    name: 'Solaria Cove Coastal Retreat',
    stay_cost: 22000,
    district: 'Southern Beachfront',
    style: 'Luxury Coastal',
    rating: 4.9,
    reviewsCount: 890,
    coordinates: { x: 760, y: 550 },
    description: 'Exclusive beachside wellness resort along the golden sand shore; premium luxury pricing for complete stay.',
    amenities: ['Private Beach Access', 'Thermal Springs', 'Infinity Pools', 'Fine Dining']
  }
];
