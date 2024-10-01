# Advanced Options

## Remote URLs

Instead of local files, the `schema`, `ui-schema`, and `data` options may be given as
URLs starting with `http://` or `https://`. These will be passed unchanged to the
underlying form.

This is useful for reusing assets hosted somewhere else, or which use complex relative
`$refs`. However, if the linked files move, become unavailable, or otherwise cannot be
reached due to browser limitations, a form cannot be rendered.

## Python

The `py-schema`, `py-ui-schema`, and `py-data` options may by importable python modules,
which must be importable at run time, either by being installed python packages or with
`sys.path` or the `PYTHONPATH` environment variable.

These may return:

- a python dictionary, which will be encoded as a normalized JSON file
- a [URL](#remote-urls) string
