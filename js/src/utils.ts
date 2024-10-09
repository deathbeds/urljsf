// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { FormProps } from '@rjsf/core';
import { isObject } from '@rjsf/utils';

import { FileForm, URLForm, Urljsf } from './_schema.js';
import { MIME_FRAGMENT } from './index.js';
import { DEBUG, TFormat } from './tokens.js';

let _NEXT_DATA_SET = 0;
const _DATA_SETS = new WeakMap<Urljsf, number>();

/** get a dataset with defaults */
export async function getConfig(el: HTMLScriptElement): Promise<Urljsf> {
  const format = el.type.replace(MIME_FRAGMENT, '') as TFormat;
  DEBUG && console.log('urlsjf', format, el);
  if (el.src) {
    DEBUG && console.warn('fetching', format, el.src);
    return fetchOne<Urljsf>(el.src, format);
  }

  return await parseOne<Urljsf>(el.innerText, format);
}

export async function initFormProps(
  form: FileForm | URLForm,
): Promise<Partial<FormProps>> {
  const [schema, uiSchema, formData] = await Promise.all([
    fetchOne(form.schema),
    fetchOne(form.ui_schema),
    fetchOne(form.form_data),
  ]);
  return { schema, uiSchema, formData };
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
export async function getFileContent(config: Urljsf, formData: any): Promise<string> {
  const { format, prune_empty } = config.file_form;
  let value = '';

  if (prune_empty) {
    formData = pruneObject(formData);
  }

  if (formData == null) {
    return '';
  }

  DEBUG && console.warn('dumping', format, formData);

  switch (format) {
    case 'json':
      value = JSON.stringify(formData, null, 2);
      break;
    case 'toml':
      let toml = await import('smol-toml');
      value = toml.stringify(formData);
      break;
    case 'yaml':
      let yaml = await import('yaml');
      value = yaml.stringify(formData);
  }
  return value;
}

export async function fetchOne<T = Record<string, any>>(
  url: string | null | undefined,
  format?: TFormat,
): Promise<T> {
  let data = {} as T;
  if (url == null) {
    return data;
  }
  const urlObj = new URL(url, window.location.href);
  const response = await fetch(urlObj);
  const { pathname } = urlObj;
  format = (format || pathname.split('.').slice(-1)[0]) as TFormat;
  format = (format as any) === 'yml' ? 'yaml' : format;

  format =
    format ||
    (pathname.endsWith('.toml')
      ? 'toml'
      : pathname.endsWith('.json')
        ? 'json'
        : 'yaml');
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

  DEBUG && console.warn('parsing', format, text);

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

/** provide an id of last resort for a config */
export function getIdPrefix(config: Urljsf): string {
  if (!_DATA_SETS.has(config)) {
    _DATA_SETS.set(config, _NEXT_DATA_SET++);
  }
  return config.file_form?.props?.idPrefix || `urljsf-${_DATA_SETS.get(config)}`;
}
