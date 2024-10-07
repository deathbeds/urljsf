import { FormProps } from '@rjsf/core';

/** JSON-compatible default values for `rjsf` [`Form.props`][form-props].
 *
 * [form-props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
 */
export interface Props
  extends Omit<FormProps, keyof Overloads | Ignored | Desired>,
    Partial<Overloads> {}

/**
 * simplifications of important fields which are out of scope to fully support inline.
 */
export interface Overloads {
  /** The uiSchema for the form */
  uiSchema: Record<string, any>;
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

/* known-good keys that serialized directly to JSON primitives. */
export type Included =
  | 'acceptCharset'
  | 'action'
  | 'autoComplete'
  | 'className'
  | 'disabled'
  | 'enctype'
  | 'extraErrorsBlockSubmit'
  | 'id'
  | 'idPrefix'
  | 'idSeparator'
  | 'liveOmit'
  | 'liveValidate'
  | 'method'
  | 'name'
  | 'noHtml5Validate'
  | 'omitExtraData'
  | 'readonly'
  | 'showErrorList'
  | 'target';

/* types we'd like to have, either as nunjucks, json lookup tables, etc. */
export type Desired =
  | 'translateString'
  | 'transformErrors'
  | 'extraErrors'
  | 'customValidate'
  // some kind of import maps
  | 'widgets'
  | 'templates'
  | 'fields';

/* known-bad keys */
export type Ignored =
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
