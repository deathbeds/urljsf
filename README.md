# `prjsf`

> Build structured data files for pull requests with JSON schema

_Powered by [react-json-schema-form](https://react-jsonschema-form.readthedocs.io)._

While GitHub provides semi-structured templates for _Pull Requests_ (PR) and _Issues_,
these are not great for structured requests, and the output requires heuristics
for parsing the markdown they generate.

With a `prjsf`-built form on a static web host, users:
- work with a precise, documented data structure
- propose a single file in a PR on a GitHub fork

## Install

> ### This package is not yet released
>
> _We're still working on it, so the instructions below are aspirational. See
> the contributing guide for more._
>
> ### From PyPI
> `prjsf` is distributed on PyPI:
>
> ```bash
> pip install prjsf
> # or...
> uv install prjsf
> # etc.
> ```
>
> ### From conda-forge
> `prjsf` is also distributed on `conda-forge`:
>
> ```bash
> pixi add prjsf
> # or...
> micromamba install -c conda-forge prjsf
> # or...
> mamba install -c conda-forge prjsf
> # or...
> conda install -c conda-forge prjsf
> ```

## Usage

`prjsf` works as a standalone site generator for simple sites, or integrates with
the `sphinx` documentation systems.

### Command Line

The `prjsf` command line generates a ready-to-serve site.

```bash
prsf --help
```

### Sphinx

``prjsf``

#### Configuration

Add `prjsf` to a project's Sphinx configuration in `conf.py`:

```py
# conf.py
extensions = [
    "prjsf.sphinx",
]
```

Provide defaults:

```py
# conf.py
prjsf = {
    # TODO: add config
}
```

#### Write

Embed forms with the `prform` directive:

```rst

.. prform:
    uri_template: https://github.com/org/repo/
    schema: ../my-form.schema.json
```
