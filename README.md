# `prjsf`

> Build structured data files for pull requests from JSON schema

_Powered by [react-json-schema-form](https://react-jsonschema-form.readthedocs.io)._

While GitHub provides semi-structured templates for _Pull Requests_ (PR) and _Issues_,
these are poor for structured requests that drive automation, requiring API tokens and
"clever" tricks for fetching and then parsing the markdown they generate.

With a `prjsf`-built form on a static web host, users:

- work with a precise, [JSON Schema][json-schema]-constrained data structure
- click to propose a single file (`.json`, `.yaml`, or `.toml`) in a PR on a GitHub fork
- see automation on a branch the user owns

[json-schema]: https://json-schema.org

## Alternatives

- GitHub
  [issue and PR templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)

## Limitations

- presently only the `bootstrap`-based theme for `react-json-schema-form` is provided
- `react-json-schema-form` cannot represent all possible data structures, such as
  writing a _new_ JSON schema in JSON schema, or many features added after Draft 7
- "advanced" YAML features such as anchors and tags are not supported
- can only propose a single file per form
- the [`sphinx`](#sphinx) integration can only target the `-b html` builder

## Install

> ### This package is not yet released
>
> _We're still working on it, so the instructions below are aspirational. See the
> contributing guide for more._
>
> ### From PyPI
>
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
>
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

`prjsf` works as a standalone site generator for simple sites, or integrates with the
`sphinx` documentation system.

### Command Line

The `prjsf` command line generates a ready-to-serve, standalone site with all required
static assets.

```bash
prsf --help
```

It requires a `schema` file and `github-url`, but offers a number options.

### Sphinx

`prjsf` was originally built as a pile of `jinja2` hacks to embed in `sphinx` sites
built by [jupyak](https://github.com/deathbeds/jupyak).

`prjsf.sphinxext` formalizes some of these hacks into a mostly-usable pattern.

#### Configuration

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

#### Write

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

## Open Source

`prjsf` includes third-party JavaScript and CSS, licensed variously under the `MIT`,
`BSD-3-Clause` and `ISC` licenses, provided in the distributions

`prjsf` itself is licensed under the `BSD-3-Clause` license. You can do whatever you
want with it.
