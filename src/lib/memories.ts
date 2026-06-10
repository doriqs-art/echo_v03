
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
    name: 'ECHO 01',
    date: 'April 2024',
    cover: '/poppy/Dog_running_through_park_202606071745.jpeg',
    mediaCount: 24,
    tagline: 'ECHO 01 _ Information',
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
    name: 'ECHO 02',
    date: 'June 2023',
    cover: '/poppy/Dog_looking_under_picnic_table_202606071745.jpeg',
    mediaCount: 9,
    tagline: 'ECHO 02 _ Information',
  },
  {
    id: 'beach-day',
    name: 'ECHO 03',
    date: 'August 2023',
    cover: '/poppy/Dog_running_on_pebbled_beach_202606071747.jpeg',
    mediaCount: 12,
    tagline: 'ECHO 03 _ Information',
  },
  {
    id: 'first-apartment',
    name: 'ECHO 04',
    date: 'February 2023',
    cover: '/poppy/Dog_searching_near_tree_roots_202606071745.jpeg',
    mediaCount: 7,
    tagline: 'ECHO 04 _ Information',
  },
  {
    id: 'riverside',
    name: 'ECHO 05',
    date: 'May 2023',
    cover: '/poppy/Dog_splashing_in_forest_stream_202606071747.jpeg',
    mediaCount: 7,
    tagline: 'ECHO 05 _ Information',
  },
  {
    id: 'first-snow',
    name: 'ECHO 06',
    date: 'December 2021',
    cover: '/poppy/Belgian_Shepherd_Corgi_mix_run_202606071747.jpeg',
    mediaCount: 14,
    tagline: 'ECHO 06 _ Information',
  },
  {
    id: 'road-trip',
    name: 'ECHO 07',
    date: 'July 2022',
    cover: '/poppy/Belgian_Shepherd_Corgi_mix_dog_202606071747.jpeg',
    mediaCount: 21,
    tagline: 'ECHO 07 _ Information',
  },
  {
    id: 'grandma',
    name: "ECHO 08",
    date: 'September 2021',
    cover: '/poppy/Dog_running_through_park_202606071745.jpeg',
    mediaCount: 16,
    tagline: 'ECHO 08 _ Information',
  },
  {
    id: 'new-year',
    name: 'ECHO 09',
    date: 'January 2022',
    cover: '/poppy/Dog_running_on_pebbled_beach_202606071747.jpeg',
    mediaCount: 10,
    tagline: 'ECHO 09 _ Information',
  },
];
