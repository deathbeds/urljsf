# `urljsf`

> Build statically-hostable, interactive HTML forms for making web requests
>
> _Powered by [`react-json-schema-form`][rjsf] and
> [`react-`][react-bootstrap][`bootstrap`][bootstrap]._

[bootstrap]: https://github.com/twbs/bootstrap
[json-schema]: https://json-schema.org
[rjsf]: https://github.com/rjsf-team/react-jsonschema-form
[react-bootstrap]: https://github.com/react-bootstrap/react-bootstrap
[ui-schema]:
  https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema/

When visiting a `urljsf`-built form, users see:

- an interative HTML form...
  - defined by and validated against a JSON [Schema][json-schema], optionally with...
    - with a customizble [user interface][ui-schema]
    - pre-filled data
    - custom validation checks

Once the data is _validated_, the user sees a button which gets a URL, which can be:

- opened a new browser window
- copy and pasted
- submitted an HTTP endpoint, either by opening a new window, or directly.
- open native applications like email

`urljsf` **doesn't** ship a server, so that part is up to you!

Site builders write TOML, JSON, or YAML, then can use `urljsf` as:

- a drop-in-and-pray [JavaScript script](#js-script)
- a standalone [CLI tool](#command-line)
- a [sphinx](#sphinx) extension

... to create JavaScript/HTML forms that helps users provide good data for:

- pull requests
- issues
- galleries
- surveys
- on-demand build services
- precise test descriptions
- linter rules

## Install

> ### This package is not yet released
>
> _We're still working on it, so the instructions below are aspirational. See the
> contributing guide for more._
>
> ### From PyPI
>
> `urljsf` is distributed on PyPI:
>
> ```bash
> pip install urljsf
>
> # or...
> uv install urljsf
>
> # etc.
> ```
>
> ### From conda-forge
>
> `urljsf` is also distributed on `conda-forge`:
>
> ```bash
> pixi add urljsf
>
> # or...
> micromamba install -c conda-forge urljsf
>
> # or...
> mamba install -c conda-forge urljsf
>
> # or...
> conda install -c conda-forge urljsf
> ```

## Usage

`urljsf` works has a:

- (not-recommended) hot-linked [`script`](#js-script)
- a standalone [site generator](#command-line) for simple sites
- a [plugin](#sphinx) for the `sphinx` documentation system

### JS Script

A very simple, but limited, usage is an `.html` file that links to `urljsf` and
`bootstrap` resources on the internet.

```html
<script type="application/vnd.deathbeds.prjsf.v0+toml">
  [forms.url.schema]
  title = "pick an xkcd"
  description = "this will redirect to `xkcd.com`"
  type = "object"
  required = ["xkcd"]
  properties.xkcd = {type="integer", minimum=1, maximum=2997}

  [forms.url.ui_schema.xkcd."ui:options"]
  widget = "range"

  [templates]
  url = "https://xkcd.com/{{ url.xkcd }}"
  submit_button = "see xkcd #{{ url.xkcd }}"
</script>
<script type="module" src="https://deathbeds.github.io/prjsf/_static/index.js"></script>
```

This technique has _many_ limitations, and is **not recommended**.

Some ways to improve:

- download a GitHub release and unpack it, serving the files next to it
- ensure bootstrap is loaded _before_ the script, with a `link` tag in a `head`.
- on the `script` element, use a `src` to point to a valid `urljsf` definition
- use the [CLI](#command-line) or [Sphinx extension](#sphinx)

### Command Line

The `urljsf` command line generates a ready-to-serve, standalone site with all required
static assets. Written in `python`, it can reuse the extensive JSON schema support in
the python ecosystem, such as `msgspec` or `pydantic`.

```bash
prsf --help
```

`urljsf` requires at least a definition file, but offers many command line options.

### Sphinx

After [installing](#install), add `urljsf.sphinxext` to `conf.py`:

```py
# conf.py
extensions = [
  # ... other extensions
  "urljsf.sphinxext",
]
```

Then use the `urljsf` directive in source files:

```rst
.. urljsf:

  # a form definition in YAML, JSON or TOML
```

See the documentation for more about configuring `urljsf.sphinxext`, the `urljsf`
directive, and more advanced use cases.

## Limitations

- `react-json-schema-form` cannot represent all possible data structures, such as
  writing a _new_ JSON schema _in_ JSON schema, or many features added after Draft 7
- the generated scripts _won't_ work when served from `file://` due to browser CORS
  headers requirements for `type="module"` scripts
- the [`sphinx`](#sphinx) integration is only tested with the `html` builder

## Open Source

`urljsf` itself is licensed under the `BSD-3-Clause` license. You can do whatever you
want with it, but if you change it a lot, it's not the maintainers' problem.

`urljsf` distributes third-party JavaScript and CSS in various forms, licensed under the
`MIT`, `BSD-3-Clause` and `ISC` licenses.
