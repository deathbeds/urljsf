// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import type { FormProps } from '@rjsf/core';
import { UIOptionsType } from '@rjsf/utils';

import { AnyForm, FileFormat, InlineObject, Urljsf } from './_schema.js';
import { LabeledAddButton } from './components/add-button.js';
import { ArrayFieldItemTemplate } from './components/array-item.js';
import { ArrayFieldTemplate } from './components/array-template.js';
import DataList from './components/datalist.js';
import { ObjectGridTemplate } from './components/object-template.js';
import { MIME_FRAGMENT } from './index.js';
import { emptyObject } from './tokens.js';

const WIDGETS = {
  'urljsf:datalist': DataList,
};

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
  const format = el.type.replace(MIME_FRAGMENT, '') as FileFormat;
  const config = await (el.src
    ? fetchOne<Urljsf>(el.src, format)
    : parseOne<Urljsf>(el.innerText, format));

  return config;
}

/** initialize form props with defaults */
export async function initFormProps(form: AnyForm): Promise<Partial<FormProps>> {
  let [props, schema, uiSchema, formData] = await Promise.all([
    fetchOneOrObject(form.props),
    fetchOneOrObject(form.schema),
    fetchOneOrObject(form.ui_schema),
    fetchOneOrObject(form.form_data),
  ]);

  return {
    ...props,
    formData,
    schema,
    templates: TEMPLATES,
    uiSchema: {
      ...(uiSchema as any),
      [GLOBAL_UI]: {
        enableMarkdownInDescription: true,
        ...((uiSchema as any)[GLOBAL_UI] || emptyObject),
        ...TEMPLATES,
      },
    },
    widgets: WIDGETS,
  } as Omit<FormProps, 'validator'>;
}

export async function fetchOneOrObject<T = Record<string, any>>(
  urlOrObject: T | string | null | undefined | InlineObject,
  format?: FileFormat,
): Promise<T> {
  if (urlOrObject && typeof urlOrObject == 'object') {
    return urlOrObject as T;
  }
  return await fetchOne<T>(urlOrObject as any, format);
}

export async function fetchOne<T = Record<string, any>>(
  url: string | null | undefined,
  format?: FileFormat,
): Promise<T> {
  let data = {} as T;
  if (url == null) {
    return data;
  }
  const urlObj = new URL(url, window.location.href);
  const response = await fetch(urlObj);
  const { pathname } = urlObj;
  format = (format || pathname.split('.').slice(-1)[0]) as FileFormat;
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
  format: FileFormat,
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
  return `urljsf-${_DATA_SETS.get(config)}`;
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
