// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { FormProps } from '@rjsf/core';
import { UIOptionsType, isObject } from '@rjsf/utils';

import { FileForm, InlineObject, URLForm, Urljsf } from './_schema.js';
import { LabeledAddButton } from './components/add-button.js';
import { ArrayFieldItemTemplate } from './components/array-item.js';
import { ArrayFieldTemplate } from './components/array-template.js';
import { ObjectGridTemplate } from './components/object-template.js';
import { MIME_FRAGMENT } from './index.js';
import { TFormat, emptyObject } from './tokens.js';

let _NEXT_DATA_SET = 0;
const _DATA_SETS = new WeakMap<Urljsf, number>();

const GLOBAL_UI = 'ui:globalOptions';

const TEMPLATES = {
  ArrayFieldTemplate,
  ObjectFieldTemplate: ObjectGridTemplate,
  ArrayFieldItemTemplate,
  ButtonTemplates: {
    AddButton: LabeledAddButton,
  },
};

/** get a dataset with defaults */
export async function getConfig(el: HTMLScriptElement): Promise<Urljsf> {
  const format = el.type.replace(MIME_FRAGMENT, '') as TFormat;
  const config = await (el.src
    ? fetchOne<Urljsf>(el.src, format)
    : parseOne<Urljsf>(el.innerText, format));

  return config;
}

/** initialize form props with defaults */
export async function initFormProps(
  form: FileForm | URLForm,
): Promise<Partial<FormProps>> {
  let [schema, uiSchema, formData] = await Promise.all([
    fetchOneOrObject(form.schema),
    fetchOneOrObject(form.ui_schema),
    fetchOneOrObject(form.form_data),
  ]);

  const props: Omit<FormProps, 'validator'> = {
    formData,
    schema: schema as any,
    templates: TEMPLATES,
    uiSchema: {
      ...(uiSchema as any),
      [GLOBAL_UI]: {
        enableMarkdownInDescription: true,
        ...((uiSchema as any)[GLOBAL_UI] || emptyObject),
        ...TEMPLATES,
      },
    },
  };

  return props;
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
  const { format, prune_empty } = config.forms.file;
  let value = '';

  if (prune_empty !== false) {
    formData = pruneObject(formData);
  }

  if (formData == null) {
    return '';
  }

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

export async function fetchOneOrObject<T = Record<string, any>>(
  urlOrObject: T | string | null | undefined | InlineObject,
  format?: TFormat,
): Promise<T> {
  if (urlOrObject && typeof urlOrObject == 'object') {
    return urlOrObject as T;
  }
  return await fetchOne<T>(urlOrObject as any, format);
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
  return config.forms.file?.props?.idPrefix || `urljsf-${_DATA_SETS.get(config)}`;
}

export function reduceTrimmedLines(memo: string, line: string): string {
  return `${memo}${line.trim()}`;
}

const MD_KEY = 'enableMarkdownInDescription';

export function useMarkdown(uiOptions: UIOptionsType): boolean {
  const globalOptions: Record<string, any> = (uiOptions.globalOptions ||
    emptyObject) as any;
  const useMarkdown =
    uiOptions[MD_KEY] != null
      ? uiOptions[MD_KEY]
      : globalOptions &&
          typeof globalOptions == 'object' &&
          globalOptions[MD_KEY] != null
        ? globalOptions[MD_KEY]
        : true;
  return useMarkdown;
}
