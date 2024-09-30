(prjsf-sphinxext)=

# Sphinx Extension

`prjsf` was originally built as a pile of `jinja2` hacks to embed in [`sphinx`][sphinx]
sites built by [jupyak](https://github.com/deathbeds/jupyak).

`prjsf.sphinxext` formalizes some of these hacks into a mostly-usable pattern.

## Configure

Add `prjsf` to a project's Sphinx configuration in `conf.py`:

```py
# conf.py
extensions = [
    "prjsf.sphinxext",
]
```

Optionally, provide defaults (using `.py`-style `_`, rather than `.rst`-style `-`):

```py
# conf.py
prjsf = {
    "github_url": "https://not-github.org",
    "github_repo": "default-org/repo",
}
```

### Style

Of particular note are some CSS opinions, which can help tune integration with sphinx
themes that use (or abuse) `bootstrap`'s class names and CSS variables.

```py
# conf.py
prjsf = {
    "css": {
        # whether to deploy the vendored bootrap.min.css (default: False)
        "add_bootstrap": True,
        # remove margins on ``h[123456]``: (default: False)
        "compact_headings": True,
        # CSS selectors in which to re-map variables (default: as shown)
        "scopes": [
            ".prsjf-pr-form",
            ".prsjf-pr-form .card",
            ".prsjf-pr-form .list-group"
        ],
        # a map of ``--{key}: var(--{value});`` (default: none)
        "variables": {
            # the below are likely to look bad if not configured to _something_
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

If `compact_headings` or `variables` are configured, a `_static/prjsf/prjsf.css` will be
written containing these extensions, and added to pages that

For more advanced uses, consider maintaining a custom stylesheet with
[`conf.py:html_css_files`][html-css-files].

[html-css-files]:
  https://www.sphinx-doc.org/en/master/usage/configuration.html#confval-html_css_files

## Write

Embed forms with the `pr-form` directive in an `.rst` file:

```rst
.. pr-form: some-org/some-repo
    schema: my-form.schema.json
```

... or an `.md` file:

````md
```{pr-form} some-org/some-repo
:schema: my-form.schema.json
```
````

Any values provided in [`conf.py`](#configure) will be overwritten.

[sphinx]: https://www.sphinx-doc.org
