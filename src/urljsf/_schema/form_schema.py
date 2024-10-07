"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from . import props_schema


class HttpMethod(Enum):
    """name of an HTTP method to use"""

    GET = "GET"
    POST = "POST"
    PUT = "PUT"


class Theme(Enum):
    """a name of a theme supported by a compatible version of `urljsf`.

    all [bootswatch] themes are available, with the vanilla [`bootstrap`][bs5] by default.

    [bs5]: https://getbootstrap.com/docs/5.0
    [bootswatch]: https://bootswatch.com

    """

    bootstrap = "bootstrap"
    cerulean = "cerulean"
    cosmo = "cosmo"
    cyborg = "cyborg"
    darkly = "darkly"
    flatly = "flatly"
    journal = "journal"
    litera = "litera"
    lumen = "lumen"
    lux = "lux"
    materia = "materia"
    minty = "minty"
    morph = "morph"
    pulse = "pulse"
    quartz = "quartz"
    sandstone = "sandstone"
    simplex = "simplex"
    sketchy = "sketchy"
    slate = "slate"
    solar = "solar"
    spacelab = "spacelab"
    superhero = "superhero"
    united = "united"
    vapor = "vapor"
    yeti = "yeti"
    zephyr = "zephyr"


@dataclass(slots=True)
class Urljsf:
    data_json_schema: str
    url_json_schema: str
    url_template: str
    data_ui_schema: str | None = None
    http_body_template: Any | None = None
    http_headers_template: str | None = None
    http_method: HttpMethod | None = HttpMethod.GET
    theme: Theme | None = Theme.bootstrap
    url_ui_schema: str | None = None


UrljsfV0 = Urljsf


RsjfProps = props_schema.Props
