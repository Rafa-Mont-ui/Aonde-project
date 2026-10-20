import * as migration_20261020_175837_initial from './20261020_175837_initial';
import * as migration_20261020_182311_add_featured from './20261020_182311_add_featured';
import * as migration_20261020_191823_media_credit from './20261020_191823_media_credit';

export const migrations = [
  {
    up: migration_20261020_175837_initial.up,
    down: migration_20261020_175837_initial.down,
    name: '20261020_175837_initial',
  },
  {
    up: migration_20261020_182311_add_featured.up,
    down: migration_20261020_182311_add_featured.down,
    name: '20261020_182311_add_featured',
  },
  {
    up: migration_20261020_191823_media_credit.up,
    down: migration_20261020_191823_media_credit.down,
    name: '20261020_191823_media_credit'
  },
];
