# Changelog

<details>
<summary>Unreleased</summary>

## 0.1.3

- [#27]
  - fixes errant `idPrefix` relying on a hard-coded form key
  - updates form schema to accept a local file for `forms.*.props`
  - adds in-development builds with `rattler-build`, published on ReadTheDocs
  - adds `schema_errors` nunjucks filter
  - adopts `@segment/ajv-human-errors` for more humane schema error messages

[#27]: https://github.com/deathbeds/urljsf/pull/27

</details>

## 0.1.2

- [#19] fixes some schema descriptions
- [#20] adds a copy-to-clipboard button to all markdown-rendered `pre` tags

[#19]: https://github.com/deathbeds/urljsf/pull/19
[#20]: https://github.com/deathbeds/urljsf/pull/20

## [0.1.1](https://github.com/deathbeds/urljsf/releases/tag/v0.1.1)

- [#12] adds an `mkdocs` plugin, available with `pip install urljsf[mkdocs]` or
  `conda install -c conda-forge urljsf-with-mkdocs`

[#12]: https://github.com/deathbeds/urljsf/pull/12

## [0.1.0](https://github.com/deathbeds/urljsf/releases/tag/v0.1.0)

- initial release
