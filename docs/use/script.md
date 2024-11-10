# Script Usage

Include `urljsf` as a `script` tag:

```html
<script
  type="module"
  src="https://deathbeds.github.io/urljsf/_static/index.js"
></script>
```

... and one or more additional `script` tags that define forms:

```html
<script type="application/vnd.deathbeds.urljsf.v0+toml">
  [forms.url.schema]
  title = "pick an xkcd"
  description = "this will redirect to `xkcd.com`"
  type = "object"
  required = ["xkcd"]
  properties.xkcd = {type="integer", minimum=1, maximum=2997}

  [forms.url.ui_schema.xkcd."ui:options"]
  widget = "range"

  [templates]
  url = "https://xkcd.com/{{ data.url.xkcd }}"
  submit_button = "see xkcd #{{ data.url.xkcd }}"
</script>
```
