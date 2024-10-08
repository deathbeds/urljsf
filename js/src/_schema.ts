/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * a path to a JSON schema, serialized as JSON, TOML, or (simple) YAML.
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-schema-location".
 */
export type ASchemaLocation = string;
/**
 * a format that can be serialized or deserialized
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-file-format".
 */
export type FileFormat = 'json' | 'toml' | 'yaml';
/**
 * a name of a theme supported by a compatible version of `urljsf`.
 *
 * all [bootswatch] themes are available, with the vanilla [`bootstrap`][bs5] by default.
 *
 * [bs5]: https://getbootstrap.com/docs/5.0
 * [bootswatch]: https://bootswatch.com
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-theme".
 */
export type Theme =
  | 'bootstrap'
  | 'cerulean'
  | 'cosmo'
  | 'cyborg'
  | 'darkly'
  | 'flatly'
  | 'journal'
  | 'litera'
  | 'lumen'
  | 'lux'
  | 'materia'
  | 'minty'
  | 'morph'
  | 'pulse'
  | 'quartz'
  | 'sandstone'
  | 'simplex'
  | 'sketchy'
  | 'slate'
  | 'solar'
  | 'spacelab'
  | 'superhero'
  | 'united'
  | 'vapor'
  | 'yeti'
  | 'zephyr';
/**
 * a [nunjucks]-compatible template.
 *
 * The [jinja compatibility layer][jinjacompat] is enabled, allowing for more expressive,
 * python-like syntax.
 *
 * [nunjucks]: https://mozilla.github.io/nunjucks
 * [jinjacompat]: https://mozilla.github.io/nunjucks/api.html#installjinjacompat
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "any-url-template".
 */
export type URLTemplate = string;

/**
 * A schema for building forms for building URLs for building...
 */
export interface Urljsf {
  file_form: FileForm;
  /**
   * isolate each form on the page in an `iframe`
   */
  iframe?: boolean;
  /**
   * additional simple CSS to apply to an `iframe` element (implies `iframe`)
   */
  iframe_style?: string;
  theme?: Theme;
  url_form: URLForm;
}
/**
 * a description of a form that builds a data file
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "file-form".
 */
export interface FileForm {
  form_data?: ASchemaLocation;
  format: FileFormat;
  props?: Props;
  /**
   * prune empty lists, object, etc.
   */
  prune_empty?: boolean;
  schema: ASchemaLocation;
  ui_schema?: ASchemaLocation;
}
/**
 * JSON-compatible default values for `rjsf` [`Form.props`][form-props].
 *
 * [form-props]: https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props
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
  /**
   * The uiSchema for the form
   */
  uiSchema?: {};
}
/**
 * a definition of a form to build a URL
 *
 * This interface was referenced by `Urljsf`'s JSON-Schema
 * via the `definition` "url-form".
 */
export interface URLForm {
  form_data?: ASchemaLocation;
  props?: Props;
  schema?: ASchemaLocation;
  ui_schema?: ASchemaLocation;
  url_template: URLTemplate;
}
