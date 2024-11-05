# UI Schema

The `rjsf` [`uiSchema`][ui-schema] provides built-in ways to control the appearance and
behavior of many fields. `urljsf` adds some extra features.

## `urljsf:grid`

By default, `rjsf` will draw all properties of an object as a vertical, scrollable list.

Sometimes, it may be desirable to use other layouts enabled by the existing Bootstrap
[grid][bs-grid] classes. Combined with the `order` field (as opposed to order-specific
classes), this can provide a more logical experience.

```json
{
  "ui:options": {
    "label": false,
    "order": ["package", "spec", "channel"],
    "urljsf:grid": {
      "children": {
        "package": ["col-md-4"],
        "spec": ["col-md-4"],
        "channel": ["col-md-4"]
      }
    }
  }
}
```

## `urljsf:datalist`

> Show autocompletion for text fields with very large domains

Wherever possible, using JSON Schema `enum`s will provide a good experience for filling
in string values. However, for very large, but potentially inexhaustive, `enums`, `rjsf`
will struggle to (re)render all the elements.

For this case, a custom `widget` is available which will provide autocompletion based on
the HTML5 [`datalist`][datalist] element. For example this JSON schema:

```json
{
    "properties": {
        "entry": {
            "description": "an entry from an encyclopedia"
            "type": "string"
        }
    }
}
```

And a UI schema:

```json
{
  "entry": {
    "ui:options": {
      "widget": "urljsf:datalist",
      "options": ["aardvark", "...", "zyvzza"]
    }
  }
}
```

When a user types at least one character, then selects an item from the list, a visual
checkbox indicator will reflect that it appears in the `datalist`. Form submission will
_not_ be blocked, though this can be added as a [`check`](./templates.md#checks), as the
`config.forms.*.ui_schema` is available.

[ui-schema]:
  https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/
[datalist]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
[bs-grid]: https://getbootstrap.com/docs/5.0/layout/grid/
