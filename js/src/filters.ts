// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { isObject } from '@rjsf/utils';

import { Ajv, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { dataUriToBuffer as dataUriToBuffer_ } from 'data-uri-to-buffer';
import type { Zippable, ZippableFile, strToU8 as strToU8_ } from 'fflate';
import type nunjucks from 'nunjucks';

import { Urljsf } from './_schema.js';
import { humanizeErrors } from './ajv.js';
import { IFilters, emptyArray } from './tokens.js';

const RE_URI_FILENAME = /;name=(.+?);/;
const RE_URI_MIME_TYPE = /^data:(.+?)[,;]/;

let AJV: Ajv;

/** remove empty objects and arrays */
export function prune(data: Record<string, any>) {
  let newData: Record<string, any> = {};
  for (let [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && !value.length) {
      continue;
    }

    if (isObject(value)) {
      value = prune(value);
    }

    if (value == null) {
      continue;
    }
    newData[key] = value;
  }
  return [...Object.keys(newData)].length ? newData : null;
}

/* build objects from entries */
export function from_entries(data: [string, any][]): Record<string, any> {
  return Object.fromEntries(data);
}

/* get schema errors */
export function schema_errors(data: any, schema: Record<string, any>): ErrorObject[] {
  AJV = AJV || addFormats(new Ajv({ allErrors: true }));
  AJV.validate(schema, data);
  return AJV.errors ? humanizeErrors(AJV.errors) : emptyArray;
}

export async function addFormatFilters(
  config: Urljsf,
  env: nunjucks.Environment,
): Promise<nunjucks.Environment> {
  for (const filter of config?.nunjucks?.filters || emptyArray) {
    let filters: IFilters | null = null;
    switch (filter) {
      case 'json':
        filters = jsonFilters();
        break;
      case 'toml':
        filters = await tomlFilters();
        break;
      case 'yaml':
        filters = await yamlFilters();
        break;
      case 'zip':
        filters = await zipFilters();
        break;
      /* istanbul ignore next */
      default:
        console.trace();
        console.warn('unknown filter', filter);
        continue;
    }

    if (filters != null) {
      env = addFilters(env, filters);
    }
  }
  return env;
}

export function addFilters(
  env: nunjucks.Environment,
  filters: IFilters,
): nunjucks.Environment {
  for (const [name, filter] of Object.entries(filters)) {
    env = env.addFilter(name, filter);
  }
  return env;
}

function jsonFilters(): IFilters {
  const filters = {
    to_json: (value: any, kwargs?: any) => {
      const indent = kwargs?.indent;
      return JSON.stringify(value, null, indent != null ? indent : 2);
    },
    to_json_url: (value: any, kwargs?: any) =>
      `data:application/json,${encodeURIComponent(filters.to_json(value, kwargs))}`,
    from_json: (value: any) => JSON.parse(value),
  };
  return filters;
}

async function tomlFilters(): Promise<IFilters> {
  const toml = await import('smol-toml');
  const filters = {
    to_toml: (value: any) => toml.stringify(value),
    to_toml_url: (value: any) =>
      `data:application/toml,${encodeURIComponent(filters.to_toml(value))}`,
    from_toml: (value: any) => toml.parse(value),
  };
  return filters;
}

async function yamlFilters(): Promise<IFilters> {
  const yaml = await import('yaml');
  const filters = {
    to_yaml: (value: any, kwargs?: any) => yaml.stringify(value, kwargs),
    to_yaml_url: (value: any, kwargs?: any) =>
      `data:application/yaml,${encodeURIComponent(filters.to_yaml(value, kwargs))}`,
    from_yaml: (value: any, kwargs?: any) => yaml.parse(value, kwargs),
  };
  return filters;
}

function _fixZippableFile(
  file: ZippableFile | [ZippableFile, any],
  strToU8: typeof strToU8_,
  dataUriToBuffer: typeof dataUriToBuffer_,
): ZippableFile {
  if (typeof file == 'string') {
    if ((file as string).startsWith('data:')) {
      const buffer = dataUriToBuffer(file);
      return new Uint8Array(buffer.buffer);
    }
    return strToU8(file);
  } else if (Array.isArray(file)) {
    return [_fixZippableFile(file[0], strToU8, dataUriToBuffer), file[1]] as any;
  } else if (!ArrayBuffer.isView(file)) {
    return _fixZippable(file, strToU8, dataUriToBuffer);
  }
  return file;
}

function _fixZippable(
  value: Zippable,
  strToU8: typeof strToU8_,
  dataUriToBuffer: typeof dataUriToBuffer_,
): Zippable {
  let clone: Zippable = {};
  for (const [name, child] of Object.entries(value)) {
    clone[name] = _fixZippableFile(child, strToU8, dataUriToBuffer);
  }
  return clone;
}

async function zipFilters(): Promise<IFilters> {
  const { zipSync, strToU8, strFromU8 } = await import('fflate');
  const { dataUriToBuffer } = await import('data-uri-to-buffer');

  return {
    to_zip_url: (value: Zippable, kwargs?: any) => {
      let name = kwargs?.name ? `;name=${encodeURIComponent(kwargs.name)}` : '';
      const fixed = _fixZippable(structuredClone(value), strToU8, dataUriToBuffer);
      const zipped = zipSync(fixed, kwargs);
      const b64 = btoa(strFromU8(zipped, true));
      return `data:application/zip${name};base64,${b64}`;
    },
  };
}

function data_uri_file(value: string) {
  const match = RE_URI_FILENAME.exec(value);
  return match ? match[1] : null;
}

function data_uri_mime(value: string) {
  const match = RE_URI_MIME_TYPE.exec(value);
  return match ? match[1] : null;
}

export const URLJSF_FILTERS = {
  prune,
  base64: btoa,
  data_uri_file,
  data_uri_mime,
  from_entries,
  schema_errors,
};
