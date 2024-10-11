// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type Nunjucks from 'nunjucks';

export async function ensureNunjucks(): Promise<typeof Nunjucks> {
  return await Private.ensureNunjucks();
}

namespace Private {
  let _nunjucks: typeof Nunjucks | null = null;
  let _loading: Promise<typeof Nunjucks> | null = null;

  export async function ensureNunjucks(): Promise<typeof Nunjucks> {
    if (_nunjucks) {
      return _nunjucks;
    }
    if (_loading) {
      return await _loading;
    }
    _loading = new Promise(async (resolve, reject) => {
      try {
        const nunjucks = await import('nunjucks');
        nunjucks.installJinjaCompat();
        _nunjucks = nunjucks;
        resolve(nunjucks);
      } catch (err) {
        reject(err);
      }
    });
    return _loading;
  }
}
