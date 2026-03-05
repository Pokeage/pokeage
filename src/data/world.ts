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
  {
    id: 'voltport',
    name: 'VOLTPORT',
    desc: 'A bustling mill powered by lightning.',
    center: true,
    gym: {
      leader: 'STORM',
      type: 'electric',
      badge: 'BOLT',
      team: [
        { monsterId: 10, level: 21 },
        { monsterId: 23, level: 23 },
        { monsterId: 11, level: 25 },
      ],
      order: 4,
    },
    routes: ['route-5'],
    nextTown: 'bloomvale',
    requiredBadge: 'STREAM',
  },
  {
    id: 'bloomvale',
    name: 'BLOOMVALE',
    desc: 'A colorful field of clover and wildflowers.',
    center: true,
    gym: {
      leader: 'CLOVER',
      type: 'grass',
      badge: 'BLOOM',
      team: [
        { monsterId: 29, level: 27 },
        { monsterId: 1, level: 28 },
        { monsterId: 2, level: 30 },
      ],
      order: 5,
    },
    routes: ['route-6'],
    nextTown: 'mistveil',
    requiredBadge: 'BOLT',
  },
  {
    id: 'mistveil',
    name: 'MISTVEIL',
    desc: 'A foggy town shrouded in morning haze.',
    center: true,
    gym: {
      leader: 'SLUDGE',
      type: 'poison',
      badge: 'MURK',
      team: [
        { monsterId: 18, level: 32 },
        { monsterId: 19, level: 33 },
        { monsterId: 19, level: 35 },
      ],
      order: 6,
    },
    routes: ['route-7'],
    nextTown: 'hauntmere',
    requiredBadge: 'BLOOM',
  },
  {
    id: 'hauntmere',
    name: 'HAUNTMERE',
    desc: 'A haunted field where lost spirits are said to wander.',
    center: true,
    gym: {
      leader: 'SHADOW',
      type: 'ghost',
      badge: 'GHOST',
      team: [
        { monsterId: 20, level: 35 },
        { monsterId: 21, level: 36 },
        { monsterId: 21, level: 38 },
      ],
      order: 7,
    },
    routes: ['route-8'],
    nextTown: 'crystalspire',
    requiredBadge: 'MURK',
  },
  {
    id: 'crystalspire',
    name: 'CRYSTALSPIRE',
    desc: 'The grandest meadow in the region, dotted with crystal springs.',
    center: true,
    gym: {
      leader: 'SAGE',
      type: 'psychic',
      badge: 'SAGE',
