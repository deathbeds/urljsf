# Templates

The top-level `templates` option describes a few key fields, such as [`url`](#url) which
are evaluated by [`nunjucks`][nunjucks].

[`checks`](#checks) are _also_ evaluated as `nunjucks` templates.

Additional `templates` can be defined and [imported][import] for reuse as blocks or
macros in other `templates` or `checks`.

[nunjucks]: https://mozilla.github.io/nunjucks/templating.html
[import]: https://mozilla.github.io/nunjucks/templating.html#import

## Context

Each `template` gets an object of this form:

```json
{
  "config": { "forms": { "a-form-key": {} } },
  "data": { "a-form-key": { "some-data-data": "from_form" } }
}
```

## Markdown

Most non-`url` templates are rendered as [Markdown][md].

Much of [GitHub flavored Markdown][gfm] is supported, but not platform-specific features
like magic `#{issue}` transforms and `mermaid` fenced code blocks. Indeed, no syntax
highlighting is supported, so generally any fence info will be discarded.

[gfm]: https://github.github.com/gfm
[md]: https://daringfireball.net/projects/markdown

### Copy Code

All `pre` tags (generated with triple ticks, tildes, etc) will be rendered with a `copy`
button.

This helps for URL-based workflows that don't allow for populating key parameters such
as GitLab's `/new/` URL, or otherwise complex ones (GitHub's `/edit/`).

In this case, it is recommended to provide a [`below_{form}`](#below-form) template
which shows the file content, with narrative describing how to copy the code and what to
do with it.

### Special Templates

A few well-known template names and patterns are used globally.

#### `url`

The `templates.url` field should generate a valid URL. All whitespace should be escaped
(e.g. use `" " | urlencode` to get `%20`), as any remaining will be removed.

#### `submit_button`

Markdown to show on the submit button, if all `checks` and schema validation are
successful. If this evaluates to the empty string, no submit button will be shown.

#### `submit_target`

The [`target`][target] for the `submit_button`. If an empty string, the default behavior
of replacing the current page will be used.

- use `_blank` to open a new browser tab
- use the name of an `<iframe name="some-iframe">` to replace that `iframe`'s content

[target]: https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/target

#### `download_filename`

A filename to suggest for `data:` URLs when the `submit_button` is shown.

#### `above_{form}`

A markdown message to show above a `form`, where `form` is a key from the root `forms`
object.

#### `below_{form}`

A markdown message to show below a `form`, where `form` is a key from the root `forms`
object.

## `checks`

On each change of any form, each member of `checks` is evaluated, then has leading and
trailing whitespace removed. If the remaining string is non-empty, the check is
considered _failed_, and the result rendered as markdown and show in the checks section
at the end of the form.

This is useful for implementing cross-cutting constraints that cannot be captured in
JSON schema, such as validating unique property values in arrays, or values matching
between two, unrelated schema.

```yaml+jinja
{
  "checks": {
    "Unique names": [
      "{% for name, things in data.thing-list.things | default([]) | groupby('name') %}",
      "{% set dupes = things | length %}",
      "{% if dupes > 1 %}",
      "- [ ] {{ dupes }} things have the name _'{{ name }}'_",
      "{% endif %}",
      "{% endfor %}"
    ]
  }
}
```

For import purposes, `checks` are nested under the `checks/` path, so must use `../` to
access other `templates`.

```yaml+jinja
{
  "templates": {
    "common": [
      "{% macro foo %}",
      "{% endmacro %}"
    ]
  },
  "checks": {
    "ok": [
      "{% import '../common' %}",
      "{{ foo() }}"
    ]
  }
}
```

## Filters

In addition to the [built-in filters][nunjucks-builtins] and the pythonic [`jinja2`
compatibility layer][jinjacompat], some custom filters are available by default, while
[format-specific](#format-filters) can be lazily loaded.

| [format][ff] | filter                     | note                                                                                   |
| :----------: | -------------------------- | -------------------------------------------------------------------------------------- |
|              | `base64`                   | encode a string as [`Base64`][base64], useful for encoding arbitrary data in URLs      |
|              | `data_uri_file`            | get the file name from a Data URL                                                      |
|              | `data_uri_mime`            | get the MIME type from a Data URL                                                      |
|              | `from_entries`             | build an object from `[key,value]` pairs with [`Object.entries`][entries]              |
|              | `prune`                    | recursively remove `null` or empty objects and arrays, useful in TOML                  |
|              | `schema_errors(schema)`    | get schema validation errors                                                           |
|    `json`    | `from_json`                | parse JSON string                                                                      |
|    `json`    | `to_json_url`              | build a [Data URL][data-url] for a JSON file                                           |
|    `json`    | `to_json`                  | build a JSON string. options: `indent=2`                                               |
|    `toml`    | `from_toml`                | parse a TOML string                                                                    |
|    `toml`    | `to_toml_url`              | build a [Data URL][data-url] for a TOML file                                           |
|    `toml`    | `to_toml`                  | build a TOML string                                                                    |
|    `yaml`    | `from_yaml`                | parse a YAML string options: [see `yaml` docs][yaml-docs]                              |
|    `yaml`    | `to_yaml_url`              | build a [Data URL][data-url] for a YAML file                                           |
|    `yaml`    | `to_yaml`                  | build a YAML string                                                                    |
|    `zip`     | `to_zip_url(name, **opts)` | create a [Data URL][data-url] for a zip archive: [see `fflate.unzipSync` docs][fflate] |

[jinjacompat]: https://mozilla.github.io/nunjucks/api.html#installjinjacompat
[nunjucks-builtins]: https://mozilla.github.io/nunjucks/templating.html#builtin-filters
[base64]: https://developer.mozilla.org/en-US/docs/Glossary/Base64
[data-url]: https://developer.mozilla.org/en-US/docs/Web/URI/Schemes/data
[entries]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
[yaml-docs]: https://eemeli.org/yaml/v1/#options
[fflate]: https://github.com/101arrowz/fflate/blob/master/docs/README.md#unzipsync

### Format Filters

[ff]: #format-filters

As `urljsf` already provides support for loading JSON, TOML, YAML as needed, the
parse/serialize functions of the underlying JS libraries may also be enabled for
templates, and lazily loaded before use.

Similarly, `.zip` files are a very common, low-barrier way to handle trees of files, but
not needed for every case.

To load all of them:

```json
{
  "nunjucks": {
    "filters": ["toml", "json", "yaml", "zip"]
  }
}
```
