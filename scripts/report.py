"""Build a report index."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

import sys
from pathlib import Path

STYLE = """
html {font-family: sans-serif;}
body {margin: 0; padding: 0}
iframe {
  position: absolute; top: 0; height: 100vh; width: 79vw; right: 0; border: 0
}
table {max-width: 20vw;}
a {text-decoration: none;}
a:hover, a:active {text-decoration: underline;}
td {text-align: right;}
td, th { padding: 0.25em; }
tbody th {text-align: left;}
thead td, thead th {border-bottom: solid 1px #aaa;}
"""

HEAD = """<html>
  <head>
    <title>urljsf test reports</title>
    <style>{}</style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>file</th>
          <td>size (kb)</td>
        </tr>
      </thead>
      <tbody>"""

FOOT = """
      </tbody>
    </table>
    <iframe name="main" src="{}"></iframe>
  </body>
</html>
"""


def main(root: Path) -> int:
    """Generate a report viewer."""
    out = root / "index.html"
    chunks = [HEAD.format(STYLE)]
    paths = [
        p
        for p in sorted(root.rglob("*.html"))
        if not (p == out or ("htmlcov" in p.parent.name and p.name != out.name))
    ]
    print("indexing", len(paths), "to", out.resolve().as_uri())
    if not paths:
        return 1
    for path in paths:
        url = path.relative_to(root)
        name = url.name
        name = str(url).replace("_", " ").replace("index.html", "")
        name = name.replace(".html", "").replace("/", " / ")
        chunks += [
            f"""<tr>
                <th>
                    <a href="{url}" target="main">{name}</a>
                </th>
                <td>
                    {int(path.stat().st_size / 1024)}
                </td>
            </tr>""",
        ]
    chunks += [FOOT.format(paths[0].relative_to(root))]
    out.write_text("\n".join(chunks), encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main(Path(sys.argv[1])))
