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

Optionally provide defaults (using `.py`-style `_`, rather than `.rst`-style `_`):

```py
# conf.py
prjsf = {
    "github_url": "https://not-github.org",
    "github_repo": "default-org/repo",
}
```

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
