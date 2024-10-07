"""Build a report index."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

import sys
from pathlib import Path

HEAD = """<html>
  <style>
    html {font-family: sans-serif;}
    body {margin: 0; padding: 0}
    iframe {position: absolute; top: 0; height: 100vh; width: 79vw; right: 0; border: 0}
    ul {display: block; max-width: 19vw; margin: 1em 1em 0 0;}
    a {text-decoration: none;}
    a:hover, a:active {text-decoration: underline;}
  </style>
  <body>
    <ul>"""

FOOT = """
    </ul>
    <iframe name="main" src="{}"></iframe>
  </body>
</html>
"""


def main(root: Path) -> int:
    """Generate a report viewer."""
    out = root / "index.html"
    chunks = [HEAD]
    paths = [
        p
        for p in sorted(root.rglob("*.html"))
        if not (p == out or ("htmlcov" in p.parent.name and p.name != out.name))
    ]
    print("indexing", len(paths), "to", out)
    if not paths:
        return 1
    for path in paths:
        url = path.relative_to(root)
        name = url.name
        name = str(url).replace("_", " ").replace("index.html", "")
        name = name.replace(".html", "")
        chunks += [
            f"""<li><a href="{url}" target="main">{name}</a></li>""",
        ]
    chunks += [FOOT.format(paths[0].relative_to(root))]
    out.write_text("\n".join(chunks), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1])))
