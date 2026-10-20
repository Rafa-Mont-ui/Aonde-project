import * as migration_20261020_175837_initial from './20261020_175837_initial';

export const migrations = [
  {
    up: migration_20261020_175837_initial.up,
    down: migration_20261020_175837_initial.down,
    name: '20261020_175837_initial'
  },
];
