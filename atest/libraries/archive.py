"""Archive keywords for ``urljsf`` acceptance tests."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import zipfile
from pathlib import Path
from urllib.request import urlopen

from robot.libraries.BuiltIn import BuiltIn


def file_in_archive_url_should_match(
    data_url: str, member: str, path: str, msg: str | None = None
) -> None:
    """Verify bytes of a file contained in a zip archive match a file on disk."""
    bi = BuiltIn()
    bi.should_start_with(data_url, "data:", msg="not a Data URL")

    with urlopen(data_url) as response, zipfile.ZipFile(response) as zf:  # noqa: S310
        files = sorted([i.filename for i in zf.filelist])
        bi.log(f"files: {files}", level="ERROR")
        bi.should_not_be_empty(files)
        member_bytes = zf.read(member)
        bi.should_be_equal(member_bytes, Path(path).read_bytes(), msg=msg)
