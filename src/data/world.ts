/* pokeAge world data: 12 towns and their routes.
   Each town gates the next behind a badge; routes define the wild and rare pools
   plus the level band. Monster ids reference the sample registry in monsters.ts.
   Pools list base species ids; instances evolve to the right stage for the level
   they spawn at. A rare pool that holds a legendary uses the legend spawn odds. */

import type { Route, Town } from '../types';

export const TOWNS: Town[] = [
  {
    id: 'seedling',
    name: 'SEEDLING TOWN',
    desc: 'A peaceful starter town where the journey begins.',
    center: true,
    gym: {
      leader: 'MOLLY',
      type: 'normal',
      badge: 'NORMAL',
      team: [
        { monsterId: 28, level: 5 },
        { monsterId: 22, level: 6 },
        { monsterId: 24, level: 7 },
      ],
      order: 0,
    },
    routes: ['route-1'],
    nextTown: 'thornwood',
    requiredBadge: null,
  },
  {
    id: 'thornwood',
    name: 'THORNWOOD',
    desc: 'A vast town shaded by ancient oak groves.',
    center: true,
    gym: {
      leader: 'BUZZ',
      type: 'bug',
      badge: 'INSECT',
      team: [
        { monsterId: 16, level: 8 },
        { monsterId: 29, level: 9 },
        { monsterId: 17, level: 11 },
      ],
      order: 1,
    },
    routes: ['route-2'],
    nextTown: 'ironridge',
    requiredBadge: 'NORMAL',
  },
  {
    id: 'ironridge',
    name: 'IRONRIDGE CITY',
    desc: 'A rugged settlement carved into the mountainside.',
    center: true,
    gym: {
      leader: 'ROCKY',
      type: 'rock',
      badge: 'BOULDER',
      team: [
        { monsterId: 12, level: 12 },
        { monsterId: 24, level: 13 },
        { monsterId: 13, level: 15 },
      ],
      order: 2,
    },
    routes: ['route-3'],
    nextTown: 'rivercrest',
    requiredBadge: 'INSECT',
  },
  {
    id: 'rivercrest',
    name: 'RIVERCREST CITY',
    desc: 'A serene port along the great brook.',
    center: true,
    gym: {
      leader: 'SPLASH',
      type: 'water',
      badge: 'STREAM',
      team: [
        { monsterId: 30, level: 18 },
        { monsterId: 7, level: 19 },
        { monsterId: 8, level: 21 },
      ],
      order: 3,
    },
    routes: ['route-4'],
    nextTown: 'voltport',
    requiredBadge: 'BOULDER',
  },
