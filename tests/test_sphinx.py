"""Verify behavior when run under ``sphinx-build``."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from pathlib import Path

import pytest
from pytest_console_scripts import ScriptRunner

from urljsf.constants import THEMES

from .conftest import NO_SCHEMA_JSON


@pytest.mark.parametrize("theme", THEMES)
def test_sphinx_theme_choice(theme: str) -> None:
    """Verify known themes work."""
    from urljsf.sphinxext.directives import a_theme

    assert theme == a_theme(theme)


def test_sphinx_theme_choice_bad() -> None:
    """Verify broken themes break."""
    from urljsf.sphinxext.directives import a_theme

    with pytest.raises(ValueError, match="choose from"):
        a_theme("not-a-theme")


def test_sphinx_build(
    a_project: str, script_runner: ScriptRunner, tmp_path: Path
) -> None:
    """Verify a site builds."""
    build = tmp_path / "build"

    args = ["sphinx-build", "-b", "html", "src", "build"]
    res = script_runner.run(args, cwd=str(tmp_path))

    assert res.success
    assert build.exists()
    built = sorted(build.rglob("*"))
    print("\n".join(list(map(str, built))))
    static = build / "_static"
    assert (static / "urljsf/urljsf.js").exists()
    if a_project not in NO_SCHEMA_JSON:
        found = sorted(static.glob("urljsf-forms/schema-*.json"))
        assert found
