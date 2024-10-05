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

Optionally, provide defaults (using `.py`-style `_`, rather than `.rst`-style `-`):

```py
# conf.py
urljsf = {
    "github_url": "https://not-github.org",
    "github_repo": "default-org/repo",
}
```

## Write

Embed forms with the `github-pr` directive in an `.rst` file:

```rst
.. github-pr: some-org/some-repo
    schema: my-form.schema.json
```

Any values provided in [`conf.py`](#configure) will be overwritten, and `:schema:`, etc.
may be a [URL](./advanced.md#remote-urls) or come from [python](./advanced.md#python).

[sphinx]: https://www.sphinx-doc.org

## Style

### Iframe

Ideally, a form would use minimal [CSS tweaks](#css) to get good-looking themes inline,
as these will look more harmonious with the rest of the site, react to user style
preferences (such as light/dark theming), and require fewer resources.

However, if style issues are too extreme (or break other things), it may be desirable to
render each form on a page as its own `iframe` element.

```py
# conf.py
urljsf = {
    # force rendering in an iframe (default: False)
    "iframe": True,
    # use a different theme (default: ``bootstrap``)
    "theme": "zephyr",
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
        # whether to deploy vendored bootrap theme CSS (default: False)
        "add_bootstrap": True,
        # remove margins on ``h[123456]``: (default: False)
        "compact_headings": True,
        # CSS selectors in which to re-map variables (default: as shown)
        "scopes": [
            ".prsjf-urljsf-form",
            ".prsjf-urljsf-form .card",
            ".prsjf-urljsf-form .list-group"
        ],
        # a map of ``--{key}: var(--{value});`` (default: ``{}``)
        "variables": {
            # the below are likely to look bad if not configured to _something_
            "bs-body-bg": "some-variable",
            "bs-body-color": "some-variable",
            "bs-card-bg": "some-variable",
            "bs-card-cap-bg": "some-variable",
            "bs-danger-text-emphasis": "some-variable",
            "bs-list-group-bg": "some-variable",
            "bs-list-group-color": "some-variable",
            "bs-secondary-color": "some-variable",
        }
    }
}
```

If `compact_headings` or `variables` are configured, a `_static/urljsf/urljsf.css` will be
written containing these extensions, and added to pages that

For more advanced uses, consider maintaining a custom stylesheet with
[`conf.py:html_css_files`][html-css-files].

[html-css-files]:
  https://www.sphinx-doc.org/en/master/usage/configuration.html#confval-html_css_files
