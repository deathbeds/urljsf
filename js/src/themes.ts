// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.

/** a set of bootstrap themes */
export const THEMES: Record<string, () => Promise<{ default: string }>> = {
  bootstrap: () => import('bootstrap/dist/css/bootstrap.min.css'),
  // bootswatch
  cerulean: () => import('bootswatch/dist/cerulean/bootstrap.min.css'),
  cosmo: () => import('bootswatch/dist/cosmo/bootstrap.min.css'),
  cyborg: () => import('bootswatch/dist/cyborg/bootstrap.min.css'),
  darkly: () => import('bootswatch/dist/darkly/bootstrap.min.css'),
  flatly: () => import('bootswatch/dist/flatly/bootstrap.min.css'),
  journal: () => import('bootswatch/dist/journal/bootstrap.min.css'),
  litera: () => import('bootswatch/dist/litera/bootstrap.min.css'),
  lumen: () => import('bootswatch/dist/lumen/bootstrap.min.css'),
  lux: () => import('bootswatch/dist/lux/bootstrap.min.css'),
  materia: () => import('bootswatch/dist/materia/bootstrap.min.css'),
  minty: () => import('bootswatch/dist/minty/bootstrap.min.css'),
  morph: () => import('bootswatch/dist/morph/bootstrap.min.css'),
  pulse: () => import('bootswatch/dist/pulse/bootstrap.min.css'),
  quartz: () => import('bootswatch/dist/quartz/bootstrap.min.css'),
  sandstone: () => import('bootswatch/dist/sandstone/bootstrap.min.css'),
  simplex: () => import('bootswatch/dist/simplex/bootstrap.min.css'),
  sketchy: () => import('bootswatch/dist/sketchy/bootstrap.min.css'),
  slate: () => import('bootswatch/dist/slate/bootstrap.min.css'),
  solar: () => import('bootswatch/dist/solar/bootstrap.min.css'),
  spacelab: () => import('bootswatch/dist/spacelab/bootstrap.min.css'),
  superhero: () => import('bootswatch/dist/superhero/bootstrap.min.css'),
  united: () => import('bootswatch/dist/united/bootstrap.min.css'),
  vapor: () => import('bootswatch/dist/vapor/bootstrap.min.css'),
  yeti: () => import('bootswatch/dist/yeti/bootstrap.min.css'),
  zephyr: () => import('bootswatch/dist/zephyr/bootstrap.min.css'),
};
