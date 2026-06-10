
export type MemoryEntry = {
  id: string;
  name: string;
  date: string;
  cover: string;
  mediaCount: number;
  tagline: string;
};

export const MEMORIES: MemoryEntry[] = [
  {
    id: 'tokyo',
    name: 'Tokyo Trip',
    date: 'April 2024',
    cover: '/poppy/Dog_running_through_park_202606071745.jpeg',
    mediaCount: 24,
    tagline: 'Neon, rain, and ramen at 2am.',
  },
  {
    id: 'poppy',
    name: 'Poppy',
    date: 'March 2024',
    cover: '/poppy/Belgian_Shepherd_Corgi_mix_dog_202606071745.jpeg',
    mediaCount: 18,
    tagline: 'The one who waited by the door.',
  },
  {
    id: 'graduation',
    name: 'Graduation',
    date: 'June 2023',
    cover: '/poppy/Dog_looking_under_picnic_table_202606071745.jpeg',
    mediaCount: 9,
    tagline: 'The day the hats went up.',
  },
  {
    id: 'beach-day',
    name: 'The Beach Day',
    date: 'August 2023',
    cover: '/poppy/Dog_running_on_pebbled_beach_202606071747.jpeg',
    mediaCount: 12,
    tagline: 'Salt, pebbles, and a stolen sandwich.',
  },
  {
    id: 'first-apartment',
    name: 'First Apartment',
    date: 'February 2023',
    cover: '/poppy/Dog_searching_near_tree_roots_202606071745.jpeg',
    mediaCount: 7,
    tagline: 'Empty rooms that slowly filled up.',
  },
  {
    id: 'riverside',
    name: 'Riverside',
    date: 'May 2023',
    cover: '/poppy/Dog_splashing_in_forest_stream_202606071747.jpeg',
    mediaCount: 7,
    tagline: 'Where the water never stopped moving.',
  },
  {
    id: 'first-snow',
    name: 'First Snow',
    date: 'December 2021',
    cover: '/poppy/Belgian_Shepherd_Corgi_mix_run_202606071747.jpeg',
    mediaCount: 14,
    tagline: 'Footprints that lasted until noon.',
  },
  {
    id: 'road-trip',
    name: 'The Road Trip',
    date: 'July 2022',
    cover: '/poppy/Belgian_Shepherd_Corgi_mix_dog_202606071747.jpeg',
    mediaCount: 21,
    tagline: 'Eleven hundred miles, one playlist.',
  },
  {
    id: 'grandma',
    name: "Grandma's House",
    date: 'September 2021',
    cover: '/poppy/Dog_running_through_park_202606071745.jpeg',
    mediaCount: 16,
    tagline: 'The kitchen always smelled like cinnamon.',
  },
  {
    id: 'new-year',
    name: 'New Year',
    date: 'January 2022',
    cover: '/poppy/Dog_running_on_pebbled_beach_202606071747.jpeg',
    mediaCount: 10,
    tagline: 'Midnight, and everyone still awake.',
  },
];
