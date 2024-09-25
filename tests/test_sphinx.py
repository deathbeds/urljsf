"""Verify behavior when run under ``sphinx-build``."""

# Copyright (C) prjsf contributors.
# Distributed under the terms of the Modified BSD License.

from pathlib import Path

from pytest_console_scripts import ScriptRunner

FORM_RST = """
title
=====

.. pr-form:: https://github.com/deathbeds/prjsf/new/not-a-branch
    :schema: ./schema.json

"""

CONF_PY = """
extensions = ["prjsf.sphinxext"]
prjsf = {"add_bootstrap_css": True}
"""

SCHEMA_JSON = """
{"type": "object", "properties": {"foo": {"type": "string"}}}
"""


def test_sphinx(script_runner: ScriptRunner, tmp_path: Path) -> None:
    src = tmp_path / "src"
    build = tmp_path / "build"
    src.mkdir()

    conf_py = src / "conf.py"
    index_rst = src / "index.rst"
    schema_json = src / "schema.json"
    conf_py.write_text(CONF_PY, encoding="utf-8")
    index_rst.write_text(FORM_RST, encoding="utf-8")
    schema_json.write_text(SCHEMA_JSON, encoding="utf-8")
    args = ["sphinx-build", "-b", "html", "src", "build"]
    res = script_runner.run(args, cwd=str(tmp_path))

    assert res.success
    assert build.exists()
    built = sorted(build.rglob("*"))
    print("\n".join(list(map(str, built))))
    static = build / "_static"
    assert (static / "prjsf/prjsf/prjsf.js").exists()
    assert (static / "pr-form/schema.json").exists()
