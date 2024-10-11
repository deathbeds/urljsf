// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type nunjucks from 'nunjucks';

export async function ensureNunjucks(): Promise<nunjucks.Environment> {
  return await Private.ensureNunjucks();
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
