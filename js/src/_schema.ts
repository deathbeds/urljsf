/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-template".
 */
export type AnyTemplate = string | [string, ...string[]];
/**
 * A schema-like object referenced by URL, or inline as an object
 */
export type ASchema = SchemaByURL | InlineObject;
/**
 * a path to a JSON schema, serialized as JSON, TOML, or (simple) YAML. The URN-like
 * `py:module.submodule:member` may be used to reference an importable module
 * `dict` or `str` member, or function that returns one, and will be expanded into
 * a JSON object or URL.
 */
export type SchemaByURL = string;
/**
 * A schema-like object referenced by URL, or inline as an object
 */
export type ASchema1 = SchemaByURL | InlineObject;
/**
 * A schema-like object referenced by URL, or inline as an object
 */
export type ASchema2 = SchemaByURL | InlineObject;
/**
 * a format that can be serialized or deserialized
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-file-format".
 */
export type FileFormat = 'json' | 'toml' | 'yaml';
/**
 * A CSS rule, or a nested selector object containing more rules
 *
 * This interface was referenced by `Styles`'s JSON-Schema definition
 * via the `patternProperty` "^.+$".
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-style".
 *
 * This interface was referenced by `Styles1`'s JSON-Schema definition
 * via the `patternProperty` "^.+$".
 */
export type AnyStyle = string | {};
/**
 * A schema-like object referenced by URL, or inline as an object
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-schema".
 */
export type ASchema3 = SchemaByURL | InlineObject;
/**
 * a path to a JSON schema, serialized as JSON, TOML, or (simple) YAML. The URN-like
 * `py:module.submodule:member` may be used to reference an importable module
 * `dict` or `str` member, or function that returns one, and will be expanded into
 * a JSON object or URL.
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-schema-location".
 */
export type AnySchemaLocation = string;
/**
 * [nunjucks](https://mozilla.github.io/nunjucks/templating.html) strings
 * (or lists of strings) that control how strings are built from forms.
 * See documentation for further customizations.
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "templates".
 */
export type Templates = KnownTemplates & {
  [k: string]: AnyTemplate;
};

/**
 * A schema for building forms for building URLs for building...
 */
export interface Urljsf {
  /**
   * an optional identifier for this instance of the `urljsf` schema
   *
   */
  $id?: string;
  /**
   * an optional identifier for the `urljsf` schema that constrains this: this
   * can be used by non-`urljsf` tools to validate and provide more insight while
   * authoring.
   *
   */
  $schema?: string;
  checks?: Checks;
  forms: Forms;
  /**
   * isolate each form on the page in an `iframe`
   */
  iframe?: boolean;
  /**
   * additional simple CSS to apply to an `iframe` element (implies `iframe`)
   *
   */
  iframe_style?: string;
  /**
   * don't try to add a link to bootstrap if missing.
   */
  no_bootstrap?: boolean;
  /**
   * options for the `nunjucks` environment
   */
  nunjucks?: {
    /**
     * filters to ensure in `nunjucks` templates
     */
    filters?: FileFormat[];
  };
  style?: Styles;
  /**
   * `nunjucks` templates that control URLs for machines and markdown for humans
   *
   */
  templates: KnownTemplates & {
    [k: string]: AnyTemplate;
  };
}
/**
 * markdown templates, which if rendered to _any_ non-whitespace, will be treated as
 * an error, preventing the submit button from being shown.
 *
 */
export interface Checks {
  [k: string]: AnyTemplate;
}
/**
 * forms that describe how to build the URL
 *
 */
export interface Forms {
  [k: string]: AnyForm;
}
/**
 * a definition of a form
 *
 * This interface was referenced by `Forms`'s JSON-Schema definition
 * via the `patternProperty` "[a-zA-Z\d\-_]+".
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-form".
 *
 * This interface was referenced by `Forms1`'s JSON-Schema definition
 * via the `patternProperty` "[a-zA-Z\d\-_]+".
 */
export interface AnyForm {
  form_data?: ASchema;
  /**
   * the order in which to show a form, lowest (or omitted) first, with a tiebreaker on name
   *
   */
  order?: number;
  props?: Props;
  schema?: ASchema1;
  ui_schema?: ASchema2;
}
/**
 * A literal object
 */
export interface InlineObject {}
/**
 * JSON-compatible default values for `rjsf` [Form.props][props].
 *
 * [props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
 */
export interface Props {
  /**
   * The value of this prop will be passed to the `accept-charset` HTML attribute on the form
   */
  acceptCharset?: string;
  /**
   * The value of this prop will be passed to the `action` HTML attribute on the form
   *
   * NOTE: this just renders the `action` attribute in the HTML markup. There is no real network request being sent to this `action` on submit. Instead, react-jsonschema-form catches the submit event with `event.preventDefault()` and then calls the `onSubmit` function, where you could send a request programmatically with `fetch` or similar.
   */
  action?: string;
  /**
   * The value of this prop will be passed to the `autocomplete` HTML attribute on the form
   */
  autoComplete?: string;
  /**
   * The value of this prop will be passed to the `class` HTML attribute on the form
   */
  className?: string;
  /**
   * It's possible to disable the whole form by setting the `disabled` prop. The `disabled` prop is then forwarded down to each field of the form. If you just want to disable some fields, see the `ui:disabled` parameter in `uiSchema`
   */
  disabled?: boolean;
  /**
   * The value of this prop will be passed to the `enctype` HTML attribute on the form
   */
  enctype?: string;
  /**
   * If set to true, causes the `extraErrors` to become blocking when the form is submitted
   */
  extraErrorsBlockSubmit?: boolean;
  /**
   * If set to true, then the first field with an error will receive the focus when the form is submitted with errors
   */
  focusOnFirstError?: boolean;
  /**
   * globals for custom UI
   */
  formContext?: {};
  /**
   * The data for the form, used to prefill a form with existing data
   */
  formData?: {};
  /**
   * The value of this prop will be passed to the `id` HTML attribute on the form
   */
  id?: string;
  /**
   * To avoid collisions with existing ids in the DOM, it is possible to change the prefix used for ids; Default is `root`
   */
  idPrefix?: string;
  /**
   * To avoid using a path separator that is present in field names, it is possible to change the separator used for ids (Default is `_`)
   */
  idSeparator?: string;
  /**
   * If `omitExtraData` and `liveOmit` are both set to true, then extra form data values that are not in any form field will be removed whenever `onChange` is called. Set to `false` by default
   */
  liveOmit?: boolean;
  /**
   * If set to true, the form will perform validation and show any validation errors whenever the form data is changed, rather than just on submit
   */
  liveValidate?: boolean;
  /**
   * The value of this prop will be passed to the `method` HTML attribute on the form
   */
  method?: string;
  /**
   * The value of this prop will be passed to the `name` HTML attribute on the form
   */
  name?: string;
  /**
   * If set to true, turns off HTML5 validation on the form; Set to `false` by default
   */
  noHtml5Validate?: boolean;
  /**
   * If set to true, then extra form data values that are not in any form field will be removed whenever `onSubmit` is called. Set to `false` by default.
   */
  omitExtraData?: boolean;
  /**
   * It's possible to make the whole form read-only by setting the `readonly` prop. The `readonly` prop is then forwarded down to each field of the form. If you just want to make some fields read-only, see the `ui:readonly` parameter in `uiSchema`
   */
  readonly?: boolean;
  /**
   * The JSON schema object for the form
   */
  schema?: {};
  /**
   * When this prop is set to `top` or 'bottom', a list of errors (or the custom error list defined in the `ErrorList`) will also show. When set to false, only inline input validation errors will be shown. Set to `top` by default
   */
  showErrorList?: false | 'top' | 'bottom';
  /**
   * It's possible to change the default `form` tag name to a different HTML tag, which can be helpful if you are nesting forms. However, native browser form behaviour, such as submitting when the `Enter` key is pressed, may no longer work
   */
  tagName?: string;
  /**
   * The value of this prop will be passed to the `target` HTML attribute on the form
   */
  target?: string;
  uiSchema?: UISchema;
}
/**
 * The uiSchema for the form
 */
export interface UISchema {
  items?: UISchema1;
  /**
   * Allows RJSF to override the default field implementation by specifying either the name of a field that is used to look up an implementation from the `fields` list or an actual one-off `Field` component implementation itself
   */
  'ui:field'?: string;
  'ui:fieldReplacesAnyOrOneOf'?: boolean;
  /**
   * An object that contains all the potential UI options in a single object
   */
  'ui:options'?: {
    /**
     * We know that for title, it will be a string, if it is provided
     */
    title?: string;
    /**
     * We know that for description, it will be a string, if it is provided
     */
    description?: string;
    /**
     * Any classnames that the user wants to be applied to a field in the ui
     */
    classNames?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as disabled
     */
    disabled?: boolean;
    /**
     * The default value to use when an input for a field is empty
     */
    emptyValue?: boolean | number | string | {} | (unknown[] & {}) | null;
    /**
     * Will disable any of the enum options specified in the array (by value)
     */
    enumDisabled?: (string | number | boolean)[];
    /**
     * Allows a user to provide a list of labels for enum values in the schema
     */
    enumNames?:
      | boolean
      | number
      | string
      | (string[] & {})
      | (string[] & unknown[])
      | null;
    /**
     * Flag, if set to `true`, will cause the `FileWidget` to show a preview (with download for non-image files)
     */
    filePreview?: boolean;
    /**
     * Used to add text next to a field to guide the end user in filling it in
     */
    help?: string;
    /**
     * Flag, if set to `true`, will hide the default error display for the given field AND all of its child fields in the hierarchy
     */
    hideError?: boolean;
    /**
     * Flag, if set to `true`, will mark a list of checkboxes as displayed all on one line instead of one per row
     */
    inline?: boolean;
    /**
     * Used to change the input type (for example, `tel` or `email`) for an <input>
     */
    inputType?: string;
    /**
     * This property allows you to reorder the properties that are shown for a particular object
     */
    order?: boolean | number | string | (string[] & {}) | (string[] & unknown[]) | null;
    /**
     * We know that for placeholder, it will be a string, if it is provided
     */
    placeholder?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as read-only
     */
    readonly?: boolean;
    /**
     * Provides a means to set the initial height of a textarea widget
     */
    rows?: number;
    style?: {};
    /**
     * custom overrides for urlsjf grid
     */
    'urljsf:grid'?: {
      addButton?: string[];
      children?: {
        [k: string]: string[];
      };
      default?: string[];
    };
    widget?: string;
  };
  'ui:rootFieldId'?: string;
  [k: string]: UISchema2 | unknown;
}
/**
 * An array of objects representing the items in the array
 */
export interface UISchema1 {
  items?: UISchema1;
  /**
   * Allows RJSF to override the default field implementation by specifying either the name of a field that is used to look up an implementation from the `fields` list or an actual one-off `Field` component implementation itself
   */
  'ui:field'?: string;
  'ui:fieldReplacesAnyOrOneOf'?: boolean;
  /**
   * An object that contains all the potential UI options in a single object
   */
  'ui:options'?: {
    /**
     * We know that for title, it will be a string, if it is provided
     */
    title?: string;
    /**
     * We know that for description, it will be a string, if it is provided
     */
    description?: string;
    /**
     * Any classnames that the user wants to be applied to a field in the ui
     */
    classNames?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as disabled
     */
    disabled?: boolean;
    /**
     * The default value to use when an input for a field is empty
     */
    emptyValue?: boolean | number | string | {} | (unknown[] & {}) | null;
    /**
     * Will disable any of the enum options specified in the array (by value)
     */
    enumDisabled?: (string | number | boolean)[];
    /**
     * Allows a user to provide a list of labels for enum values in the schema
     */
    enumNames?:
      | boolean
      | number
      | string
      | (string[] & {})
      | (string[] & unknown[])
      | null;
    /**
     * Flag, if set to `true`, will cause the `FileWidget` to show a preview (with download for non-image files)
     */
    filePreview?: boolean;
    /**
     * Used to add text next to a field to guide the end user in filling it in
     */
    help?: string;
    /**
     * Flag, if set to `true`, will hide the default error display for the given field AND all of its child fields in the hierarchy
     */
    hideError?: boolean;
    /**
     * Flag, if set to `true`, will mark a list of checkboxes as displayed all on one line instead of one per row
     */
    inline?: boolean;
    /**
     * Used to change the input type (for example, `tel` or `email`) for an <input>
     */
    inputType?: string;
    /**
     * This property allows you to reorder the properties that are shown for a particular object
     */
    order?: boolean | number | string | (string[] & {}) | (string[] & unknown[]) | null;
    /**
     * We know that for placeholder, it will be a string, if it is provided
     */
    placeholder?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as read-only
     */
    readonly?: boolean;
    /**
     * Provides a means to set the initial height of a textarea widget
     */
    rows?: number;
    style?: {};
    /**
     * custom overrides for urlsjf grid
     */
    'urljsf:grid'?: {
      addButton?: string[];
      children?: {
        [k: string]: string[];
      };
      default?: string[];
    };
    widget?: string;
  };
  'ui:rootFieldId'?: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "UISchema".
 */
export interface UISchema2 {
  items?: UISchema1;
  /**
   * Allows RJSF to override the default field implementation by specifying either the name of a field that is used to look up an implementation from the `fields` list or an actual one-off `Field` component implementation itself
   */
  'ui:field'?: string;
  'ui:fieldReplacesAnyOrOneOf'?: boolean;
  /**
   * An object that contains all the potential UI options in a single object
   */
  'ui:options'?: {
    /**
     * We know that for title, it will be a string, if it is provided
     */
    title?: string;
    /**
     * We know that for description, it will be a string, if it is provided
     */
    description?: string;
    /**
     * Any classnames that the user wants to be applied to a field in the ui
     */
    classNames?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as disabled
     */
    disabled?: boolean;
    /**
     * The default value to use when an input for a field is empty
     */
    emptyValue?: boolean | number | string | {} | (unknown[] & {}) | null;
    /**
     * Will disable any of the enum options specified in the array (by value)
     */
    enumDisabled?: (string | number | boolean)[];
    /**
     * Allows a user to provide a list of labels for enum values in the schema
     */
    enumNames?:
      | boolean
      | number
      | string
      | (string[] & {})
      | (string[] & unknown[])
      | null;
    /**
     * Flag, if set to `true`, will cause the `FileWidget` to show a preview (with download for non-image files)
     */
    filePreview?: boolean;
    /**
     * Used to add text next to a field to guide the end user in filling it in
     */
    help?: string;
    /**
     * Flag, if set to `true`, will hide the default error display for the given field AND all of its child fields in the hierarchy
     */
    hideError?: boolean;
    /**
     * Flag, if set to `true`, will mark a list of checkboxes as displayed all on one line instead of one per row
     */
    inline?: boolean;
    /**
     * Used to change the input type (for example, `tel` or `email`) for an <input>
     */
    inputType?: string;
    /**
     * This property allows you to reorder the properties that are shown for a particular object
     */
    order?: boolean | number | string | (string[] & {}) | (string[] & unknown[]) | null;
    /**
     * We know that for placeholder, it will be a string, if it is provided
     */
    placeholder?: string;
    /**
     * Flag, if set to `true`, will mark all child widgets from a given field as read-only
     */
    readonly?: boolean;
    /**
     * Provides a means to set the initial height of a textarea widget
     */
    rows?: number;
    style?: {};
    /**
     * custom overrides for urlsjf grid
     */
    'urljsf:grid'?: {
      addButton?: string[];
      children?: {
        [k: string]: string[];
      };
      default?: string[];
    };
    widget?: string;
  };
  'ui:rootFieldId'?: string;
  [k: string]: UISchema2 | unknown;
}
/**
 * simple CSS rules scoped to the current form id, or objects keyed by child
 * selector
 *
 */
export interface Styles {
  [k: string]: AnyStyle;
}
/**
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "known-templates".
 */
export interface KnownTemplates {
  /**
   * If given, a template for the submit button's `download` attribute, to
   * suggest an appropriate filename, with leading and trailing whitespace trimmed.
   *
   */
  download_filename?: string | [string, ...string[]];
  /**
   * text to show on the button when a form is valid. multiple lines will be joined
   * with `\n`, then leading and trailing whitespace will be trimmed.
   *
   */
  submit_button?: string | [string, ...string[]];
  /**
   * a URL to build. all whitespace will be trimmed, then joined with no delimiter.
   *
   */
  url?: string | [string, ...string[]];
}
/**
 * JSON-compatible default values for `rjsf` [Form.props][props].
 *
 * [props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "Props".
 */
export interface Props1 {
  /**
   * The value of this prop will be passed to the `accept-charset` HTML attribute on the form
   */
  acceptCharset?: string;
  /**
   * The value of this prop will be passed to the `action` HTML attribute on the form
   *
   * NOTE: this just renders the `action` attribute in the HTML markup. There is no real network request being sent to this `action` on submit. Instead, react-jsonschema-form catches the submit event with `event.preventDefault()` and then calls the `onSubmit` function, where you could send a request programmatically with `fetch` or similar.
   */
  action?: string;
  /**
   * The value of this prop will be passed to the `autocomplete` HTML attribute on the form
   */
  autoComplete?: string;
  /**
   * The value of this prop will be passed to the `class` HTML attribute on the form
   */
  className?: string;
  /**
   * It's possible to disable the whole form by setting the `disabled` prop. The `disabled` prop is then forwarded down to each field of the form. If you just want to disable some fields, see the `ui:disabled` parameter in `uiSchema`
   */
  disabled?: boolean;
  /**
   * The value of this prop will be passed to the `enctype` HTML attribute on the form
   */
  enctype?: string;
  /**
   * If set to true, causes the `extraErrors` to become blocking when the form is submitted
   */
  extraErrorsBlockSubmit?: boolean;
  /**
   * If set to true, then the first field with an error will receive the focus when the form is submitted with errors
   */
  focusOnFirstError?: boolean;
  /**
   * globals for custom UI
   */
  formContext?: {};
  /**
   * The data for the form, used to prefill a form with existing data
   */
  formData?: {};
  /**
   * The value of this prop will be passed to the `id` HTML attribute on the form
   */
  id?: string;
  /**
   * To avoid collisions with existing ids in the DOM, it is possible to change the prefix used for ids; Default is `root`
   */
  idPrefix?: string;
  /**
   * To avoid using a path separator that is present in field names, it is possible to change the separator used for ids (Default is `_`)
   */
  idSeparator?: string;
  /**
   * If `omitExtraData` and `liveOmit` are both set to true, then extra form data values that are not in any form field will be removed whenever `onChange` is called. Set to `false` by default
   */
  liveOmit?: boolean;
  /**
   * If set to true, the form will perform validation and show any validation errors whenever the form data is changed, rather than just on submit
   */
  liveValidate?: boolean;
  /**
   * The value of this prop will be passed to the `method` HTML attribute on the form
   */
  method?: string;
  /**
   * The value of this prop will be passed to the `name` HTML attribute on the form
   */
  name?: string;
  /**
   * If set to true, turns off HTML5 validation on the form; Set to `false` by default
   */
  noHtml5Validate?: boolean;
  /**
   * If set to true, then extra form data values that are not in any form field will be removed whenever `onSubmit` is called. Set to `false` by default.
   */
  omitExtraData?: boolean;
  /**
   * It's possible to make the whole form read-only by setting the `readonly` prop. The `readonly` prop is then forwarded down to each field of the form. If you just want to make some fields read-only, see the `ui:readonly` parameter in `uiSchema`
   */
  readonly?: boolean;
  /**
   * The JSON schema object for the form
   */
  schema?: {};
  /**
   * When this prop is set to `top` or 'bottom', a list of errors (or the custom error list defined in the `ErrorList`) will also show. When set to false, only inline input validation errors will be shown. Set to `top` by default
   */
  showErrorList?: false | 'top' | 'bottom';
  /**
   * It's possible to change the default `form` tag name to a different HTML tag, which can be helpful if you are nesting forms. However, native browser form behaviour, such as submitting when the `Enter` key is pressed, may no longer work
   */
  tagName?: string;
  /**
   * The value of this prop will be passed to the `target` HTML attribute on the form
   */
  target?: string;
  uiSchema?: UISchema;
}
/**
 * A literal object
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-object".
 */
export interface AnInlineObject {}
/**
 * `nunjucks` templates keyed by the label displayed to a form user: any evaluating
 * to a non-whitespace string will be considered _failing_.
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "checks".
 */
export interface Checks1 {
  [k: string]: AnyTemplate;
}
/**
 * forms used to build and populate a URL
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "forms".
 */
export interface Forms1 {
  [k: string]: AnyForm;
}
/**
 * CSS rules, or nested selector objects containing more rules
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "styles".
 */
export interface Styles1 {
  [k: string]: AnyStyle;
}
