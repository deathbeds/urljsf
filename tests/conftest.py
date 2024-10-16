"""Test configuration for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import os
import platform
import shutil
import sys
from pathlib import Path
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from collections.abc import Generator

    from pytest_html.report_data import ReportData

WIN = os.name == "win32"
SEP = ";" if WIN else ":"
UTF8 = {"encoding": "utf-8"}
HERE = Path(__file__).parent
FIXTURES = HERE / "fixtures"

SPHINX_PROJECTS = FIXTURES / "sphinx"
ALL_SPHINX_PROJECTS = {p.name: p for p in SPHINX_PROJECTS.glob("*") if p.is_dir()}

CLI_PROJECTS = FIXTURES / "cli"
VALID_CLI_PROJECTS = CLI_PROJECTS / "valid"
ALL_VALID_CLI_PROJECTS = {p.name: p for p in VALID_CLI_PROJECTS.glob("*") if p.is_dir()}

pytest_plugins = ("sphinx.testing.fixtures",)

#: names of fixture projects that won't deploy `schema.json`
NO_SCHEMA_JSON = ["remote"]


def pytest_html_report_title(report: ReportData) -> None:
    """Provide a ``pytest-html`` page title."""
    from urljsf import __version__

    u = platform.uname()
    py = ".".join(map(str, sys.version_info[:3]))
    report.title = f"urljsf {__version__} (Python {py}) ({u.system} {u.machine})"


@pytest.fixture
def py_tmp_path(tmp_path: Path) -> Generator[Path, None, None]:
    """Wrap a temporary directory added to ``PYTHONPATH``."""
    var_name = "PYTHONPATH"
    old_py_path = os.environ.get(var_name)

    new_py_path = str(tmp_path.resolve())
    if old_py_path:
        new_py_path = SEP.join([new_py_path, old_py_path])
    os.environ[var_name] = new_py_path
    yield tmp_path
    if old_py_path:
        os.environ[var_name] = old_py_path
    else:
        os.environ.pop(var_name)


@pytest.fixture(params=sorted(ALL_SPHINX_PROJECTS.keys()))
def a_sphinx_project(request: pytest.FixtureRequest, tmp_path: Path) -> Path:
    """Project a project fixture."""
    dest = tmp_path / "src"
    shutil.copytree(SPHINX_PROJECTS / request.param, dest)
    return request.param


@pytest.fixture(params=sorted(ALL_VALID_CLI_PROJECTS.keys()))
def a_valid_cli_project(request: pytest.FixtureRequest, tmp_path: Path) -> Path:
    """Project a project fixture."""
    dest = tmp_path / "src"
    shutil.copytree(VALID_CLI_PROJECTS / request.param, dest)
    return request.param
