/**
 * Wishlist Places for Aethelgard Bay (15 Destinations total)
 * Contract requirements:
 * - Exactly 15 places (main city)
 * - Both attractions and signature food stops (>= 3 of each)
 * - IDs conform to ^[A-Z][A-Z0-9_-]{0,15}$
 * - Non-empty display names
 * - whole-number importance from 1 through 5, with at least 3 distinct values
 */
export const MOCK_DESTINATIONS = [
  // --- 8 ATTRACTIONS ---
  {
    id: 'P01_CITADEL',
    name: 'Aethelgard Citadel',
    type: 'attraction',
    defaultImportance: 4,
    coordinates: { x: 330, y: 90 },
    icon: 'Shield',
    categoryLabel: 'Historical Landmark',
    description: 'Ancient stone fortress perched high above the bay with 360-degree rampart panoramas.'
  },
  {
    id: 'P02_MUSEUM',
    name: 'Maritime Art Museum',
    type: 'attraction',
    defaultImportance: 3,
    coordinates: { x: 440, y: 180 },
    icon: 'Landmark',
    categoryLabel: 'Museum & Gallery',
    description: 'Centuries of classical coastal masterpieces and navigational cartography exhibitions.'
  },
  {
    id: 'P03_RIVERWALK',
    name: 'Aethel River Promenade',
    type: 'attraction',
    defaultImportance: 4,
    coordinates: { x: 500, y: 410 },
    icon: 'Compass',
    categoryLabel: 'Scenic Riverside Walk',
    description: 'Iconic tree-lined waterfront promenade beloved for sunset strolls and open-air musicians.'
  },
  {
    id: 'P04_OPERA',
    name: 'Royal Grand Opera House',
    type: 'attraction',
    defaultImportance: 3,
    coordinates: { x: 570, y: 120 },
    icon: 'Music',
    categoryLabel: 'Cultural Landmark',
    description: 'Neoclassical architectural jewel hosting nightly world-class symphonic and choral performances.'
  },
  {
    id: 'P05_CLOCK_TOWER',
    name: 'St. Alden Clock Tower',
    type: 'attraction',
    defaultImportance: 2,
    coordinates: { x: 520, y: 290 },
    icon: 'Clock',
    categoryLabel: 'Historic Monument',
    description: 'Gothic chiming clock tower in the bustling civic square, famous for its hourly mechanical parade.'
  },
  {
    id: 'P06_BOTANIC',
    name: 'Imperial Botanic Gardens',
    type: 'attraction',
    defaultImportance: 3,
    coordinates: { x: 860, y: 240 },
    icon: 'Trees',
    categoryLabel: 'Nature & Conservatories',
    description: 'Expansive Victorian glasshouses sheltering thousands of rare subtropical and alpine species.'
  },
  {
    id: 'P07_OBSERVATORY',
    name: 'Crown Cliff Observatory',
    type: 'attraction',
    defaultImportance: 2,
    coordinates: { x: 870, y: 460 },
    icon: 'Eye',
    categoryLabel: 'Panoramic Lookout',
    description: 'Scenic headland dome with astronomical exhibits and dramatic cliff views over the ocean.'
  },
  {
    id: 'P08_CATHEDRAL',
    name: 'Cathedral of St. Jude',
    type: 'attraction',
    defaultImportance: 3,
    coordinates: { x: 410, y: 140 },
    icon: 'Church',
    categoryLabel: 'Heritage Monument',
    description: 'Soaring medieval spires and magnificent stained glass windows standing at the heart of Old Town.'
  },

  // --- 7 SIGNATURE FOOD STOPS ---
  {
    id: 'P09_NIGHT_MKT',
    name: 'Old Port Night Market',
    type: 'food',
    defaultImportance: 2, // Default 2; can be boosted to 5 in what-if test
    coordinates: { x: 260, y: 390 },
    icon: 'UtensilsCrossed',
    categoryLabel: 'Night Market & Stalls',
    description: 'Atmospheric lantern-lit alleys packed with sizzling street food skewers, dumplings, and sweets.'
  },
  {
    id: 'P10_SEAFOOD_PIER',
    name: 'Neptune Wharf Oyster Pier',
    type: 'food',
    defaultImportance: 4,
    coordinates: { x: 120, y: 360 },
    icon: 'Fish',
    categoryLabel: 'Signature Seafood',
    description: 'Celebrated dockside oyster stalls and salt-crusted catch cooked directly from morning fishing boats.'
  },
  {
    id: 'P11_BAKERY_SQ',
    name: 'Citadel Brioche & Bakery',
    type: 'food',
    defaultImportance: 3,
    coordinates: { x: 350, y: 170 },
    icon: 'Coffee',
    categoryLabel: 'Artisan Pastry',
    description: 'Generations-old bakery famed for caramelized honey buns, flakey croissants, and rich dark roast.'
  },
  {
    id: 'P12_SPICE_ALLEY',
    name: 'Silk & Spice Tavern',
    type: 'food',
    defaultImportance: 3,
    coordinates: { x: 440, y: 260 },
    icon: 'Flame',
    categoryLabel: 'Heritage Spice Bistro',
    description: 'Cozy brick cellar restaurant cooking signature spiced seafood stews and wood-fired flatbreads.'
  },
  {
    id: 'P13_NOODLE_LANE',
    name: 'Dragon Canal Noodle Bar',
    type: 'food',
    defaultImportance: 4,
    coordinates: { x: 430, y: 470 },
    icon: 'BowlFood',
    categoryLabel: 'Regional Specialty',
    description: 'Legendary handmade pulled noodles served in slow-simmered rich savory broth with chili crisps.'
  },
  {
    id: 'P14_ROAST_HOUSE',
    name: 'Black Boar Smokehouse',
    type: 'food',
    defaultImportance: 2,
    coordinates: { x: 590, y: 330 },
    icon: 'Beef',
    categoryLabel: 'Traditional Roastery',
    description: 'Historic tavern renowned for oak-smoked ribs, spiced sausages, and local craft ciders.'
  },
  {
    id: 'P15_TEA_PAVILION',
    name: 'Pavilion Herbal Tea House',
    type: 'food',
    defaultImportance: 1,
    coordinates: { x: 740, y: 200 },
    icon: 'CupSoda',
    categoryLabel: 'Traditional Tea & Sweets',
    description: 'Peaceful garden pagoda serving delicate ceremonial blossoms, matcha infusions, and lotus cakes.'
  }
];
