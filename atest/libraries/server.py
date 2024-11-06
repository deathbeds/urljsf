"""Acceptance tests for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

import asyncio
import shutil
import socket
import sys
import tempfile
from pathlib import Path

from tornado import httpserver, log, web


async def start_http_server(port: int, path: str) -> None:
    """Run an http server."""

    class StaticHandler(web.StaticFileHandler):
        def parse_url_path(self, url_path: str) -> str:
            """Handle ``index.html``."""
            url_path = super().parse_url_path(url_path=url_path)
            if not url_path or url_path.endswith("/"):
                url_path = f"{url_path}/index.html"
            return url_path

    app = web.Application(
        [("^/(.*)", StaticHandler, {"path": path})],
        debug=True,
    )
    http_server = httpserver.HTTPServer(app)
    http_server.listen(port)
    log.app_log.warning("[%s] serving %s", port, path)
    await asyncio.Event().wait()


def get_unused_port() -> int:
    """Find an unused network port (could still create race conditions)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("localhost", 0))
    s.listen(1)
    port = s.getsockname()[1]
    s.close()
    if not isinstance(port, int):
        msg = f"don't know what to do with port {port}"
        raise TypeError(msg)
    return port


def main(argv: list[str] | None = None) -> int:
    """Parse args and Run the server forever."""
    port, static, patch, dist_cov = argv or sys.argv[1:]

    with tempfile.TemporaryDirectory() as td:
        tdp = Path(td)
        root = tdp / "root"
        assets = root / patch
        shutil.copytree(static, root)
        shutil.rmtree(assets)
        shutil.copytree(dist_cov, assets)
        asyncio.run(start_http_server(int(port), str(root)))

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
