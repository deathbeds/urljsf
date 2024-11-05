# Templates

The top-level `templates` option describes a few key fields, such as `url`, which are
evaluated by [`nunjucks`][nunjucks].

[nunjucks]: https://mozilla.github.io/nunjucks/templating.html

## Context

Each `template` gets an object of this form:

```json
{
  "config": { "forms": { "a-form-key": {} } },
  "data": { "a-form-key": { "data": "from_form" } }
}
```

## Filters

In addition to the [built-in filters][nunjucks-builtins], some custom filters are
available by default:

- `prune`
  - recursively remove `null` objects and empty arrays and objects
- `base64`
  - encode a string as `base64`
- `from_entries`
  - turn a list of `[key,value]` pairs into a dictionary, as per Python's `dict`
    constructor

[nunjucks-builtins]: https://mozilla.github.io/nunjucks/templating.html#builtin-filters

### Format Filters

As `urljsf` supports loading JSON, TOML, YAML, these may also be enabled in the
templating layer:

```json
{
  "nunjucks": {
    "filters": ["toml", "json", "yaml"]
  }
}
```

These enable new filters:

| filter      | note                | options                      |
| ----------- | ------------------- | ---------------------------- |
| `to_json`   | build a JSON string | `indent=2`                   |
| `from_json` | parse JSON string   |                              |
| `to_toml`   | build a TOML string |                              |
| `from_toml` | parse a TOML string |                              |
| `to_yaml`   | build a YAML string | [see `yaml` docs][yaml-docs] |
| `from_yaml` | parse a YAML string |                              |

[yaml-docs]: https://eemeli.org/yaml/v1/#options

## `url`

The `templates.url` field has some special requirements, and should generate a valid
URL.

## `checks`

Each member of `checks` is evaluated, then has leading and trailing whitespace removed.
If the remaining string is non-empty, the check is considered _failed_, and the result
rendered as markdown and show in the checks section.

This is useful for implementing cross-cutting constraints that cannot be captured in
JSON schema, such as validating unique property values in arrays.

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
