// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type nunjucks from 'nunjucks';

import { Urljsf } from './_schema.js';
import { FILTERS, addFilters, ensureFilters } from './filters.js';
import { IRenderOptions } from './tokens.js';
import { reduceTrimmedLines } from './utils.js';

export async function ensureNunjucks(config: Urljsf): Promise<nunjucks.Environment> {
  const env = await Private.ensureNunjucks();
  ensureFilters(config, env);
  return env;
}

export function renderUrl(options: IRenderOptions): string {
  const template = Array.isArray(options.template)
    ? options.template.join('\n')
    : options.template;

  return options.env
    .renderString(template, options.context)
    .split('\n')
    .reduce(reduceTrimmedLines)
    .trim();
}

export function renderMarkdown(options: IRenderOptions): string {
  const template = Array.isArray(options.template)
    ? options.template.join('\n')
    : options.template;
  return options.env.renderString(template, options.context).trim();
}

namespace Private {
  let _env: nunjucks.Environment | null = null;
  let _loading: Promise<nunjucks.Environment> | null = null;

  export async function ensureNunjucks(): Promise<nunjucks.Environment> {
    if (_env) {
      return _env;
    }
    if (_loading) {
      return await _loading;
    }
    _loading = new Promise(async (resolve, reject) => {
      try {
        const nunjucks = await import('nunjucks');
        nunjucks.installJinjaCompat();
        const env = new nunjucks.Environment();
        addFilters(env, FILTERS);
        _env = env;
        resolve(env);
      } catch (err) {
        reject(err);
      }
    });
    return _loading;
  }
}
