// Copyright (C) prjsf contributors.
// Distributed under the terms of the Modified BSD License.
import { isObject } from '@rjsf/utils';

import { ALL_KEYS, DEFAULTS, TDataSet, TUrlKey } from './tokens.js';

let _NEXT_DATA_SET = 0;
const _DATA_SETS = new WeakMap<TDataSet, number>();

/** get a dataset with defaults */
export function getDataSet(el: HTMLElement): TDataSet {
  const dataset: TDataSet = {};
  for (const k of [...ALL_KEYS]) {
    dataset[k] = el.dataset[k] || (DEFAULTS as any as TDataSet)[k];
  }
  return dataset;
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
  const format = dataset.prjsfDataFormat;
  if (dataset.prjsfPruneEmpty === 'true') {
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

  const response = await fetch(url);
  let data: any = {};
  const format = dataset[`${key}Format`] || 'json';

  if (response.ok) {
    const text = await response.text();
    switch (format) {
      case 'json':
        data = JSON.parse(text);
        break;
      case 'toml':
        let toml = await import('smol-toml');
        data = toml.parse(text);
        break;
      case 'yaml':
        let yaml = await import('yaml');
        data = yaml.parse(text);
        break;
    }
  }

  return data;
}

/** provide an id of last resort for a dataset */
export function getIdPrefix(dataset: TDataSet): string {
  if (!_DATA_SETS.has(dataset)) {
    _DATA_SETS.set(dataset, _NEXT_DATA_SET++);
  }
  return dataset.prjsfIdPrefix || `prjsf-${_DATA_SETS.get(dataset)}`;
}
