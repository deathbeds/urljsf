(urljsf-mkdocsext)=

# Mkdocs Extension

The `mkdocs` extension is mostly derived from the [`sphinx`](./sphinx.md) extension.

This extension requires [`mkdocs`][mkdocs] and [`pymdown-extensions`][pmdx] to be
installed. Adding the `[mkdocs]` extra will help ensure _at least_ minimum tested
versions are installed e.g.:

- `pip install urljsf[mkdocs]`
- `conda install urljsf-with-mkdocs`

[mkdocs]: https://www.mkdocs.org
[pmdx]: https://github.com/facelessuser/pymdown-extensions

## Configure

Add `urljsf` to a project's `mkdocs` configuration in `mkdocs.yml`:

```yaml
# mkdocs.yml
plugins:
  - urljsf
  # these are added if missing
  # - pymdownx.superfences
  # - attr_list
```

Optionally, provide a partial [schema](./schema.rst) object with `defaults` that will be
merged with every form definition:

```yaml
# mkdocs.yml
plugins:
  - urljsf:
      defaults:
        iframe: true
        no_bootstrap: true
```

## Write

Embed forms with the `urljsf` fenced code block in an `.md` file:

````markdown
> As a relative or absolute path:

```urljsf {path=./path/to/urljsf.toml}

```

> As inline `json`, `toml`, or `yaml`:

```urljsf {format=toml}
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
```
````

Any values provided in [`mkdocs.yml`](#configure) will be overwritten, and `schema`,
etc. may be a [URL](./advanced/remote.md#remote-urls) or come from
[python](./advanced/remote.md#python).
