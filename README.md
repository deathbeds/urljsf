# `prjsf`

> Build structured data files for pull requests from JSON schema
>
> _Powered by [`react-json-schema-form`][rjsf] and [bootstrap][bootstrap]._

[rjsf]: https://github.com/rjsf-team/react-jsonschema-form
[bootstrap]: https://github.com/twbs/bootstrap

GitHub projects can use `prjsf` as a standalone [CLI tool](#command-line) or
[sphinx](#sphinx) extension to create static HTML forms that jumpstart contibution to
data-driven:

- galleries
- on-demand build services
- precise test descriptions

When visiting a `prjsf`-built form, users:

- see with an interative [JSON Schema][json-schema]-constrained HTML form, optionally
  with...
  - ... a [user interface schema][ui-schema]
  - ... pre-filled data
- click to propose a single file (`.json`, `.yaml`, or `.toml`) in a PR on a GitHub fork
- see automation on a branch the user owns
- get automatic, actionable notifications of failures

[ui-schema]:
  https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/
[json-schema]: https://json-schema.org

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
>
> # or...
> uv install prjsf
>
> # etc.
> ```
>
> ### From conda-forge
>
> `prjsf` is also distributed on `conda-forge`:
>
> ```bash
> pixi add prjsf
>
> # or...
> micromamba install -c conda-forge prjsf
>
> # or...
> mamba install -c conda-forge prjsf
>
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

`prjsf` requires a `--schema` file (or `--py-schema` module) and `--github-repo`, but
can be further customized with a number of other options.

### Sphinx

After [installing](#install), add this to `conf.py`:

```py
# conf.py
extensions = [
  # ... other extensions
  "prjsf.sphinxext",
]
```

Then use the `pr-form` directive:

```rst
.. pr-form: a-github-org/a-github-repo
  :schema: path/to/schema.json
```

See the documentation for more about configuring `prjsf.sphinxext` and the `pr-form`
directive.

## Limitations

- `react-json-schema-form` cannot represent all possible data structures, such as
  writing a _new_ JSON schema in JSON schema, or many features added after Draft 7
- advanced YAML features such as `&anchors` and `!!tags` are not supported
- can only propose a single file per form
- the generated scripts _won't_ work when served from `file://` due to browser CORS
  headers requirements for `type="module"` scripts
- the [`sphinx`](#sphinx) integration os only tested with the `html` builder

## Alternatives

A number of other approaches can help users submit _public_ data which can be used to
drive automation:

- GitHub [issue templates][issue-templates] and [some][issue-parser1]
  [parser][issue-parser2]
  - requires a GitHub account
- Google [Forms][g-forms]
  - creating a form requires a Google account
  - submissions _can_ be anonymous, but this reduces the cost to spammers

[issue-templates]:
  https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests
[issue-parser1]: https://github.com/stefanbuck/github-issue-parser
[issue-parser2]: https://github.com/peter-murray/issue-forms-body-parser
[g-forms]: https://www.google.com/forms/about

## Open Source

`prjsf` includes third-party JavaScript and CSS, licensed variously under the `MIT`,
`BSD-3-Clause` and `ISC` licenses, provided in the distributions

`prjsf` itself is licensed under the `BSD-3-Clause` license. You can do whatever you
want with it.
