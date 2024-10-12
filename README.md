# `urljsf`

> Build statically-hostable, interactive HTML forms for making web requests
>
> _Powered by [`react-json-schema-form`][rjsf] and
> [`react-`][react-bootstrap][`bootstrap`][bootstrap]._

[rjsf]: https://github.com/rjsf-team/react-jsonschema-form
[bootstrap]: https://github.com/twbs/bootstrap
[react-bootstrap]: https://github.com/react-bootstrap/react-bootstrap

Projects can use `urljsf` as:

- a [JavaScript library](#js-library)
- a standalone [CLI tool](#command-line)
- a [sphinx](#sphinx) extension

... to create JavaScript/HTML forms that jumpstart contibution to data-driven:

- galleries
- on-demand build services
- precise test descriptions
- linter rules

... or pretty much anything that accepts a `POST` or `GET`, or even email.

When visiting a `urljsf`-built form, users:

- see an interative HTML form...
  - defined by and validated against a JSON [Schema][json-schema], optionally with...
    - with a customizble [user interface][ui-schema]
    - pre-filled data
    - custom validation messages

Once the data is _validated_, the user sees a button which submits the form to an HTTPS
endpoint, either by opening a new window, or directly.

While almost _any_ URL can be built, special care is given for _pull requests_, which
create excellent data for projects and users.

For example, the GitHub `/new/` pull request URL starts a workflow to:

- request the user log into GitHub
- create a fork owned by the user
- show _another_ form, with:
  - new `.json`, `.yaml`, or `.toml` file
  - a commit message
  - a branch target
- after confirming and submitting _that_ form, the user:
  - sees automation workflows on their branch
  - on failure, get automatic, actionable notifications
  - on success, get access to build artifacts, reports, or drive further automation

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

### JS Library

`urljsf` works as a standalone site generator for simple sites, or integrates with the
`sphinx` documentation system.

A very simple form might look like:

```html
<html>
  <head>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      integrity="sha256-PI8n5gCcz9cQqQXm3PEtDuPG8qx9oFsFctPg0S5zb8g="
      crossorigin="anonymous"
    />
  </head>
  <body>
    <script type="application/vnd.deathbeds.prjsf.v0+toml">
      [forms.url]
      schema = "./toml/url.schema.toml"
      ui_schema = "./toml/url.uischema.toml"

      [forms.file]
      format = "toml"
      schema = "./toml/file.schema.toml"
      ui_schema = "./toml/file.uischema.toml"
      form_data = "./toml/file.data.toml"

      [templates]
      url = """
      https://github.com/{{ url.repo }}/new/{{ url.branch }}?
      {{
          {"filename": url.filename, "value": text } | urlencode | safe
      }}
      """

      """
    </script>
    <script
      type="module"
      src="https://deathbeds.github.io/prjsf/_static/index.js"
    ></script>
  </body>
</html>
```

### Command Line

The `urljsf` command line generates a ready-to-serve, standalone site with all required
static assets.

```bash
prsf --help
```

`urljsf` requires a `--schema` file (or `--py-schema` module) and `--github-repo`, but
can be further customized with a number of other options.

### Sphinx

After [installing](#install), add `urljsf.sphinxext` to `conf.py`:

```py
# conf.py
extensions = [
  # ... other extensions
  "urljsf.sphinxext",
]
```

Then use the `github-pr` directive in source files:

```rst
.. github-pr: a-github-org/a-github-repo
  :schema: path/to/schema.json
```

See the documentation for more about configuring `urljsf.sphinxext`, the `github-pr`
directive, and more advanced use cases.

## Limitations

- only works with GitHub's `/new/` URL
  - GitLab offers a _similar_ endpoint, but it doesn't [accept file
    content][gl-content-url] from a request parameter
- `react-json-schema-form` cannot represent all possible data structures, such as
  writing a _new_ JSON schema in JSON schema, or many features added after Draft 7
- advanced YAML features such as `&anchors` and `!!tags` are not supported
- can only propose a single file per form
- the generated scripts _won't_ work when served from `file://` due to browser CORS
  headers requirements for `type="module"` scripts
- the [`sphinx`](#sphinx) integration is only tested with the `html` builder

## Alternatives

A number of other approaches can help authenticated users submit data which can be used
to drive automation:

| approach                                  | project needs                                      | user needs         |
| ----------------------------------------- | -------------------------------------------------- | ------------------ |
| GitHub [issue templates][issue-templates] | [some][issue-parser1] [parser][issue-parser2]      | GitHub account     |
| Google [Forms][g-forms]                   | Google account to create form, polling for changes | Google account `*` |
| GitLab merge requests                     | GitLab account                                     | GitLab account `+` |
| OpenAPI                                   | Running server                                     | Account on server  |

> - `*` while it is **possible** to accept anonymous form submissions, this reduces the
>   cost to spammers, which can make the data less valuable to a project
> - `+` GitLab merge request URLs **can't** include [file content][gl-content-url],
>   requiring an extra copy & paste by the user

[issue-templates]:
  https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests
[issue-parser1]: https://github.com/stefanbuck/github-issue-parser
[issue-parser2]: https://github.com/peter-murray/issue-forms-body-parser
[g-forms]: https://www.google.com/forms/about
[gl-content-url]: https://gitlab.com/gitlab-org/gitlab/-/issues/297236

## Open Source

`urljsf` includes third-party JavaScript and CSS, licensed variously under the `MIT`,
`BSD-3-Clause` and `ISC` licenses, provided in the distributions.

`urljsf` itself is licensed under the `BSD-3-Clause` license. You can do whatever you
want with it, but if you change it a lot, it's not the maintainers' problem.
