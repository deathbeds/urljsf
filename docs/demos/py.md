# Python Demo

> use an importable python module to show built-in `rjsf` HTML5 widgets.

```{urljsf}
:format: yaml

forms:
  url: {}
  file:
    format: yaml
    schema: py:demos:kitchen_sink_schema
    ui_schema: py:demos:kitchen_sink_ui_schema
templates:
  url: "#"
  submit_button: |
    <pre>{{ text }}</pre>
```
