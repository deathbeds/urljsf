// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type nunjucks from 'nunjucks';

import { IContext } from './tokens.js';
import { reduceTrimmedLines } from './utils.js';

export async function ensureNunjucks(): Promise<nunjucks.Environment> {
  return await Private.ensureNunjucks();
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

export interface IRenderOptions {
  template: string | string[];
  context: IContext;
  env: nunjucks.Environment;
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
        env.addFilter('base64', btoa);
        _env = env;
        resolve(env);
      } catch (err) {
        reject(err);
      }
    });
    return _loading;
  }
}
