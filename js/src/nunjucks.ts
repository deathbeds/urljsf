// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type nunjucks from 'nunjucks';

import { Urljsf } from './_schema.js';
import { URLJSF_FILTERS, addFilters, addFormatFilters } from './filters.js';
import { CHECKS_PATH_PREFIX, IRenderOptions } from './tokens.js';

class UrljsfLoader implements nunjucks.ILoader {
  private _config: Urljsf;
  constructor(config: Urljsf) {
    this._config = config;
  }

  getSource(name: string): nunjucks.LoaderSource {
    const { templates, checks } = this._config;
    const isCheck = checks && name.startsWith(CHECKS_PATH_PREFIX);
    name = isCheck ? name.slice(8) : name;
    const template = isCheck ? checks[name] : templates[`${name}`];
    let src = typeof template == 'string' ? template : template.join('\n');
    return { path: name, src, noCache: false };
  }
}

export async function ensureNunjucks(config: Urljsf): Promise<nunjucks.Environment> {
  const nunjucks = await Private.ensureNunjucks();
  let env = new nunjucks.Environment(new UrljsfLoader(config));
  env = addFilters(env, URLJSF_FILTERS);
  env = await addFormatFilters(config, env);
  return env;
}

export function renderMarkdown(options: IRenderOptions): string {
  const { env, path, context, fallback } = options;
  let md = fallback == null ? '' : fallback;
  try {
    md = env.render(path, context).trim();
  } catch (err) {
    console.warn('failed to render template', path, err);
  }
  return md;
}

namespace Private {
  let _nunjucks: typeof nunjucks | null = null;
  let _loading: Promise<typeof nunjucks> | null = null;

  export async function ensureNunjucks(): Promise<typeof nunjucks> {
    if (_nunjucks) {
      return _nunjucks;
    }
    if (!_loading) {
      _loading = new Promise(async (resolve, reject) => {
        try {
          const nunjucks = await import('nunjucks');
          nunjucks.installJinjaCompat();
          _nunjucks = nunjucks;
          resolve(nunjucks);
        } catch (err) {
          /* istanbul ignore next */
          reject(err);
        }
      });
    }
    return await _loading;
  }
}
