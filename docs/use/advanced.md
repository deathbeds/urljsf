# Advanced Options

## URL Fields

The `schema`, `ui_schema`, and `form_data` properties for both the `url` and `file` form
describe independently constrained documents, which doesn't work well with most JSON
schema tools.

For a complex form, it can make sense to keep documents in separate files, generate them
on the fly, or rely on a form user's browser to fetch them at run-time.

### Remote URLs

Instead of local files, the `schema`, `ui_schema`, and `form_data` options may be given
as URLs starting with `http://` or `https://`. These will be passed unchanged to the
underlying form.

This is useful for reusing assets hosted somewhere else, or which use complex relative
`$refs`. However, if the linked files move, become unavailable, or otherwise cannot be
reached due to browser limitations, a form will not be rendered.

### Python

The `py-schema`, `py-ui-schema`, and `py-data` options may by importable python modules,
which must be importable at run time, either by being installed python packages or with
`sys.path` or the `PYTHONPATH` environment variable.

These may return:

- a python dictionary, which will be encoded as a normalized JSON file
- a [URL](#remote-urls) string
