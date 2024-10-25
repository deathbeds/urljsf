// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { isObject } from '@rjsf/utils';

import type nunjucks from 'nunjucks';

import { Urljsf } from './_schema';
import { IFilters } from './tokens';

const ENV_FILTERS: Map<string, boolean> = new Map();

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
export async function ensureFilters(config: Urljsf, env: nunjucks.Environment) {
  for (const filter of config?.nunjucks?.filters || []) {
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
      default:
        console.warn('Unknown filter', filter);
        continue;
    }

    if (filters != null) {
      addFilters(env, filters);
    }
  }
}

export function addFilters(env: nunjucks.Environment, filters: IFilters) {
  for (const [name, filter] of Object.entries(filters)) {
    if (ENV_FILTERS.has(name)) {
      continue;
    }
    env.addFilter(name, filter);
    ENV_FILTERS.set(name, true);
  }
}

function jsonFilters(): IFilters {
  return {
    to_json: (value: any, kwargs?: any) => {
      const indent = kwargs?.indent;
      return JSON.stringify(value, null, indent != null ? indent : 2);
    },
    from_json: (value: any) => {
      return JSON.parse(value);
    },
  };
}

async function tomlFilters(): Promise<IFilters> {
  const toml = await import('smol-toml');
  return {
    to_toml: (value: any) => toml.stringify(value),
    from_toml: (value: any) => toml.parse(value),
  };
}

async function yamlFilters(): Promise<IFilters> {
  let yaml = await import('yaml');
  return {
    to_yaml: (value: any, kwargs?: any) => yaml.stringify(value, kwargs),
    from_yaml: (value: any, kwargs?: any) => yaml.parse(value, kwargs),
  };
}

export const FILTERS = { prune, base64: btoa };
