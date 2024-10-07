"""JSON Schema for ``urljsf``."""
# Copyright (C) urljsf contributors.
# Distributed under the terms of the Modified BSD License.

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from . import props_schema

AnySchemaLocation = str


class AnyTheme(Enum):
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


AnyUrlTemplate = str


@dataclass(slots=True)
class FileForm:
    """a description of a form that builds a data file
    """

    schema_: AnySchemaLocation
    props: props_schema.Props | None = None
    ui_schema: AnySchemaLocation | None = None


@dataclass(slots=True)
class UrlForm:
    """a definition of a form to build a URL
    """

    url_template: AnyUrlTemplate
    props: props_schema.Props | None = None
    schema_: AnySchemaLocation | None = None
    ui_schema: AnySchemaLocation | None = None


@dataclass(slots=True)
class Urljsf:
    """A schema for building forms for building URLs for building...
    """

    file_form: FileForm
    url_form: UrlForm
    theme: AnyTheme | None = AnyTheme.bootstrap
