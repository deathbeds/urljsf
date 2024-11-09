// Copyright (C) urljsf contributors.
import type { FormProps } from '@rjsf/core';
import type { RJSFValidationError } from '@rjsf/utils';

import type { ReadonlySignal } from '@preact/signals';
import type nunjucks from 'nunjucks';

import { Urljsf } from './_schema';

// Distributed under the terms of the Modified BSD License.
export const DEBUG = window.location.href.includes('URLJSF_DEBUG');

export const DEFAULTS: Partial<Urljsf> = {
  iframe_style: 'width: 100%; height: 80vh;',
};

export const BOOTSTRAP_ID = 'urljsf-bootstrap';

export const emptyObject = Object.freeze({});

export const FORM_CLASS = 'urljsf-form';

export const CHECKS_PATH_PREFIX = 'checks/';

export interface IErrors {
  [key: string]: RJSFValidationError[];
}

export interface IContext {
  config: Urljsf;
  data: Record<string, Record<string, any> | null>;
}

export interface IFormsProps {
  [key: string]: Partial<FormProps> | null;
}

export interface IUrljsfFormProps {
  config: Urljsf;
  forms: IFormsProps;
  nunjucksEnv: nunjucks.Environment;
}

export interface IAboveBelowForms {
  [key: string]: IFormAboveBelow;
}

export interface IFormAboveBelow {
  above?: ReadonlySignal<string>;
  below?: ReadonlySignal<string>;
}

export interface IRenderOptions {
  /** the name of the template to render */
  path: string;
  context: IContext;
  env: nunjucks.Environment;
  fallback?: string;
}

export interface IFilter {
  (value: any, ...args: any): any;
}

export interface IFilters {
  [key: string]: IFilter;
}
