// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
export const DEBUG = window.location.href.includes('URLJSF_DEBUG');

export const META_KEYS = [
  'urljsfFileName',
  'urljsfFileNamePattern',
  'urljsfPruneEmpty',
  'urljsfIdPrefix',
  'urljsfIframe',
  'urljsfIframeStyle',
  'urljsfTheme',
  'urljsfUrlTemplate',
] as const;
export const PROVIDER_KEYS = [
  'urljsfGitHubUrl',
  'urljsfGitHubRepo',
  'urljsfGitHubBranch',
] as const;
export const URL_KEYS = ['urljsfData', 'urljsfSchema', 'urljsfUiSchema'] as const;
export const FORMAT_KEYS = [
  'urljsfSchemaFormat',
  'urljsfUiSchemaFormat',
  'urljsfDataFormat',
] as const;
export const ALL_KEYS = [...PROVIDER_KEYS, ...URL_KEYS, ...FORMAT_KEYS, ...META_KEYS];

export type TProviderKey = (typeof PROVIDER_KEYS)[number];
export type TFormatKey = (typeof FORMAT_KEYS)[number];
export type TUrlKey = (typeof URL_KEYS)[number];
export type TMetaKey = (typeof META_KEYS)[number];
export type TDataKey = TProviderKey | TFormatKey | TUrlKey | TMetaKey;

export type TDataSet = Partial<{
  [K in TDataKey]: string | null;
}>;

export const DEFAULTS = {
  urljsfUrlTemplate: '',
  urljsfFileNamePattern: `^[^/].+\.(json|yaml|yml|toml)$`,
  urljsfSchemaFormat: 'json',
  urljsfUiSchemaFormat: 'json',
  urljsfDataFormat: 'json',
  urljsfPruneEmpty: 'true',
  urljsfGitHubBranch: 'main',
  urljsfGitHubUrl: 'https://github.com',
  urljsfIframeStyle: 'width: 100%; height: 80vh;',
  urljsfTheme: 'bootstrap',
};

export type TFormat = 'json' | 'yaml' | 'toml';
