(urljsf-sphinxext)=

# Sphinx Extension

`urljsf` was originally built as a pile of `jinja2` hacks to embed in [`sphinx`][sphinx]
sites built by [jupyak](https://github.com/deathbeds/jupyak).

`urljsf.sphinxext` formalizes some of these hacks into a mostly-usable pattern.

## Configure

Add `urljsf` to a project's Sphinx configuration in `conf.py`:

```py
# conf.py
extensions = [
    "urljsf.sphinxext",
]
```

Optionally, provide defaults that will be merged with every form definition:

```py
# conf.py
urljsf = {
    "iframe": True,
    "no_bootstrap": True
}
```

## Write

Embed forms with the `urljsf` directive in an `.rst` file:

```rst
As a relative or absolute path:

.. urljsf:: ./path/to/urljsf.toml

As inline `json`, `toml`, or `yaml`:

.. urljsf::
    :format: toml

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

Any values provided in [`conf.py`](#configure) will be overwritten, and `schema`, etc.
may be a [URL](./advanced.md#remote-urls) or come from [python](./advanced.md#python).

[sphinx]: https://www.sphinx-doc.org

## Style

### Iframe

Ideally, a form would use minimal [CSS tweaks](#css) to get good-looking themes inline,
as these will look more harmonious with the rest of the site, react to user style
preferences (such as light/dark theming), and require fewer resources.

However, if style issues are too extreme, it may be desirable to render each form on a
page as its own `iframe` element.

```py
# conf.py
urljsf = {
    # force rendering in an iframe (default: False)
    "iframe": True,
    # a reasonable default style, accounting for sticky headers (default: as shown)
    "iframe_style": "width: 100%; height: 80vh;",
}
```

### CSS

Of particular note are some CSS opinions, which can help tune integration with sphinx
themes that use (or abuse) the _hundreds_ of `bootstrap` class names and CSS variables.

```py
# conf.py
urljsf = {
    "css": {
        "style": {
            # the below are likely to look bad if not configured to _something_
            "--bs-body-bg": "var(--some-variable)",
            "--bs-body-color": "var(--some-variable)",
            "--bs-card-bg": "var(--some-variable)",
            "--bs-card-cap-bg": "var(--some-variable)",
            "--bs-danger-text-emphasis": "var(--some-variable)",
            "--bs-secondary-color": "var(--some-variable)",
            # these need a further selector
            ".list-group": {
                "--bs-list-group-bg": "var(--some-variable)",
                "--bs-list-group-color": "var(--some-variable)",
                "--bs-list-group-border-color": "var(--some-variable)"
            }
        }
    }
}
```

For more advanced uses, consider maintaining a custom stylesheet with
[`conf.py:html_css_files`][html-css-files].

[html-css-files]:
  https://www.sphinx-doc.org/en/master/usage/configuration.html#confval-html_css_files
