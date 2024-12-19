"""Verify repository properties."""

# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

import pytest

from .conftest import ROOT, UTF8

if not (ROOT / ".git").exists():
    pytest.skip(reason="not in the repo", allow_module_level=True)


@pytest.mark.parametrize(
    ("path", "fragment"),
    [
        (".github/workflows/ci.yml", "URLJSF_PIXI_VERSION: {}"),
        (".github/workflows/pages.yml", "URLJSF_PIXI_VERSION: {}"),
        ("docs/.readthedocs.yaml", "pixi=={}"),
        ("docs/demos.py", "pixi.sh/v{}/schema"),
    ],
)
def test_pixi_version(path: str, fragment: str, the_pixi_version: str) -> None:
    """Verify the ``pixi`` version is consistent."""
    txt = (ROOT / path).read_text(**UTF8)
    assert fragment.format(the_pixi_version) in txt


@pytest.mark.parametrize(
    ("path", "fragment"),
    [
        ("CHANGELOG.md", "\n## {}\n"),
    ],
)
def test_py_version(path: str, fragment: str, the_py_version: str) -> None:
    """Verify the ``urljsf`` version is consistent."""
    txt = (ROOT / path).read_text(**UTF8)
    assert fragment.format(the_py_version) in txt


@pytest.mark.parametrize(
    ("path", "fragment"),
    [
        ("js/package.json", '"@deathbeds/urljsf",\n  "version": "{}",'),
    ],
)
def test_js_version(path: str, fragment: str, the_js_version: str) -> None:
    """Verify the ``urljsf`` version is consistent."""
    txt = (ROOT / path).read_text(**UTF8)
    assert fragment.format(the_js_version) in txt
