// Copyright (C) urljsf contributors.
// Distributed under the terms of the Modified BSD License.
import { FormProps } from '@rjsf/core';
import { UIOptionsType, UiSchema } from '@rjsf/utils';

/** JSON-compatible default values for `rjsf` [`Form.props`][form-props].
 *
 * [form-props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
 */
export default interface Props
  extends Omit<FormProps, keyof Overloads | IgnoredProps | DesiredProps>,
    Partial<Overloads> {}

export interface UrljsfGridOptions {
  default: string[];
  children: Record<string, string[]>;
  addButton: string[];
}

export interface UrljsfUIOptions {
  'urljsf:grid': Partial<UrljsfGridOptions>;
}

export interface SimpleRjsfUIOptions
  extends Pick<
    UIOptionsType<any, any, any>,
    | 'classNames'
    | 'description'
    | 'disabled'
    | 'emptyValue'
    | 'enumDisabled'
    | 'enumNames'
    | 'filePreview'
    | 'help'
    | 'hideError'
    | 'inline'
    | 'inputType'
    | 'order'
    | 'placeholder'
    | 'readonly'
    | 'rows'
    | 'title'
  > {
  style: Record<string, any>;
  widget: string;
  autoComplete: boolean;
  autoFocus: boolean;
  enumDisabled: Array<string | number | boolean>;
  enumNames: string[];
  order: string[];
}

/** an rjsf ui schema, with light extension
 */
export interface KnownUISchema {
  'ui:urljsf:grid'?: Partial<UrljsfGridOptions>;
  'ui:options'?: Partial<UrljsfUIOptions> & Partial<SimpleRjsfUIOptions>;
}

export interface ItemSchema {
  items: UISchema;
}

export interface SimpleUISchema
  extends Omit<
    UiSchema<any, any, any>,
    'ui:options' | 'ui:globalOptions' | 'ui:field'
  > {
  'ui:field'?: string;
}

export type UISchema = KnownUISchema | ItemSchema | SimpleUISchema;

/**
 * simplifications of important fields which are out of scope to fully support inline.
 */
export interface Overloads {
  /** The uiSchema for the form */
  uiSchema: UISchema;
  /** The JSON schema object for the form */
  schema: Record<string, any>;
  /** globals for custom UI */
  formContext: Record<string, any>;
  /** The data for the form, used to prefill a form with existing data */
  formData: Record<string, any>;
  /** If set to true, then the first field with an error will receive the focus
   * when the form is submitted with errors
   */
  focusOnFirstError: boolean;
  /** It's possible to change the default `form` tag name to a different HTML
   * tag, which can be helpful if you are nesting forms. However, native browser
   * form behaviour, such as submitting when the `Enter` key is pressed, may no
   * longer work
   */
  tagName: string;
}

/* types we'd like to have, either as nunjucks, json lookup tables, etc. */
type DesiredProps =
  | 'translateString'
  | 'transformErrors'
  | 'extraErrors'
  | 'customValidate'
  // some kind of import maps
  | 'widgets'
  | 'templates'
  | 'fields';

/* known unrepresentable keys */
type IgnoredProps =
  | 'validator'
  | 'children'
  | 'experimental_defaultFormStateBehavior'
  | '_internalFormWrapper'
  | 'ref'
  | 'onFocus'
  | 'onBlur'
  | 'onSubmit'
  | 'onError'
  | 'onChange'
  | 'noValidate'
  | 'acceptcharset';
