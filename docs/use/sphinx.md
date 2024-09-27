# Sphinx

`prjsf` was originally built as a pile of `jinja2` hacks to embed in [`sphinx`][sphinx]
sites built by [jupyak](https://github.com/deathbeds/jupyak).

`prjsf.sphinxext` formalizes some of these hacks into a mostly-usable pattern.

## Configuration

Add `prjsf` to a project's Sphinx configuration in `conf.py`:

```py
# conf.py
extensions = [
    "prjsf.sphinxext",
]
```

Provide defaults:

```py
# conf.py
prjsf = {
    # TODO: add config
}
```

## Write

Embed forms with the `pr-form` directive in an `.rst` file:

```rst

.. pr-form: https://github.com/some-org/some-repo/new/some-branch
    schema: my-form.schema.json
```

... or an `.md` file:

````md
```{pr-form} https://github.com/some-org/some-repo/new/some-branch
:schema: my-form.schema.json
```
````

[sphinx]: https://www.sphinx-doc.org
