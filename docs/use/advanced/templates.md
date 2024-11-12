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

### Special Templates

A few well-known template names and patterns are used globally.

#### `url`

The `templates.url` field should generate a valid URL. All whitespace should be escaped
(e.g. use `" " | urlencode` to get `%20`), as any remaining will be removed.

#### `submit_button`

The text to show on the submit button, if all `checks` and schema validation are
successful.

#### `download_filename`

A filename to suggest for `data:` URLs.

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

| filter           | note                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| `base64`         | encode a string as [`Base64`][base64], useful for encoding arbitrary data in URLs |
| `from_entries`   | build an object from `[key,value]` pairs with [`Object.entries`][entries]         |
| `prune`          | recursively remove `null` objects and empty arrays and objects, useful in TOML    |
| `to_json` [ff]   | build a JSON string. options: `indent=2`                                          |
| `from_json` [ff] | parse JSON string                                                                 |
| `to_toml` [ff]   | build a TOML string                                                               |
| `from_toml` [ff] | parse a TOML string                                                               |
| `to_yaml` [ff]   | build a YAML string                                                               |
| `from_yaml` [ff] | parse a YAML string options: [see `yaml` docs][yaml-docs]                         |

[jinjacompat]: https://mozilla.github.io/nunjucks/api.html#installjinjacompat
[nunjucks-builtins]: https://mozilla.github.io/nunjucks/templating.html#builtin-filters
[base64]: https://developer.mozilla.org/en-US/docs/Glossary/Base64
[entries]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
[yaml-docs]: https://eemeli.org/yaml/v1/#options

### Format Filters

[ff]: #format-filters

As `urljsf` already provides support for loading JSON, TOML, YAML as needed, the
parse/serialize functions of the underlying JS libraries may also be enabled for
templates, and lazily loaded before use. To load all of them:

```json
{
  "nunjucks": {
    "filters": ["toml", "json", "yaml"]
  }
}
```
