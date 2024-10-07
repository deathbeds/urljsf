// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { isObject } from '@rjsf/utils';

import { Urljsf } from './_schema.js';
import { MIME_FRAGMENT } from './index.js';
import { TDataSet, TFormat, TUrlKey } from './tokens.js';

let _NEXT_DATA_SET = 0;
const _DATA_SETS = new WeakMap<TDataSet, number>();

/** get a dataset with defaults */
export async function getConfig(el: HTMLScriptElement): Promise<Urljsf> {
  const format = el.type.replace(MIME_FRAGMENT, '') as TFormat;

  if (el.src) {
    return fetchOne<Urljsf>(el.src, format);
  }

  return await parseOne<Urljsf>(el.innerText, format);
}

/** remove empty objects and arrays */
function pruneObject(data: Record<string, any>) {
  let newData: Record<string, any> = {};
  for (let [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && !value.length) {
      continue;
    }

    if (isObject(value)) {
      value = pruneObject(value);
    }

    if (value == null) {
      continue;
    }
    newData[key] = value;
  }
  return [...Object.keys(newData)].length ? newData : null;
}

/** lazily serialize some data */
export async function getFileContent(
  dataset: TDataSet,
  formData: any,
): Promise<string> {
  const format = dataset.urljsfDataFormat;
  if (dataset.urljsfPruneEmpty === 'true') {
    formData = pruneObject(formData);
  }

  if (formData == null) {
    return '';
  }

  switch (format) {
    case 'json':
      return JSON.stringify(formData, null, 2);
    case 'toml':
      let toml = await import('smol-toml');
      return toml.stringify(formData);
    case 'yaml':
      let yaml = await import('yaml');
      return yaml.stringify(formData);
  }
  return '';
}
/** fetch some data and lazily parse it */
export async function fetchData(dataset: TDataSet, key: TUrlKey): Promise<any> {
  let url = dataset[key];

  if (!url) {
    return {};
  }

  return await fetchOne(url);
}

export async function fetchOne<T = Record<string, any>>(
  url: string | null | undefined,
  format?: 'json' | 'toml' | 'yaml',
): Promise<T> {
  let data = {} as T;
  if (url == null) {
    return data;
  }
  const urlObj = new URL(url, window.location.href);
  const response = await fetch(urlObj);
  const { pathname } = urlObj;
  format =
    format || pathname.endsWith('.toml')
      ? 'toml'
      : pathname.endsWith('.json')
        ? 'json'
        : 'yaml';
  if (response.ok) {
    data = await parseOne<T>(await response.text(), format);
  }
  return data;
}

export async function parseOne<T = Record<string, any>>(
  text: string,
  format: TFormat,
): Promise<T> {
  let data = {} as T;

  switch (format) {
    case 'json':
      data = JSON.parse(text);
      break;
    case 'toml':
      let toml = await import('smol-toml');
      data = toml.parse(text) as T;
      break;
    case 'yaml':
      let yaml = await import('yaml');
      data = yaml.parse(text);
      break;
  }
  return data;
}

/** provide an id of last resort for a dataset */
export function getIdPrefix(dataset: TDataSet): string {
  if (!_DATA_SETS.has(dataset)) {
    _DATA_SETS.set(dataset, _NEXT_DATA_SET++);
  }
  return dataset.urljsfIdPrefix || `urljsf-${_DATA_SETS.get(dataset)}`;
}
