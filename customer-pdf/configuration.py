"""Load and validate portable customer-delivery PDF configurations."""
import json
from pathlib import Path


REQUIRED_PALETTE_KEYS = {
    "background", "surface", "lightSurface", "pink", "pinkSoft", "coral",
    "blush", "text", "muted", "line",
}


def load_config(path):
    config = json.loads(Path(path).read_text(encoding="utf-8"))
    validate_config(config)
    return config


def validate_config(config):
    if config.get("schemaVersion") != "1.0":
        raise ValueError("Unsupported customer PDF schemaVersion")
    for key in ("product", "webapp", "features", "categories", "intensities", "quickStart", "print", "files", "palette", "layout"):
        if key not in config:
            raise ValueError(f"Missing configuration key: {key}")
    url = config["webapp"].get("url", "")
    if not url.startswith("https://") or not url.endswith("/"):
        raise ValueError("WebApp URL must be an HTTPS URL with a trailing slash")
    if config["webapp"].get("cta") != "PLAY NOW":
        raise ValueError("Customer CTA must be PLAY NOW")
    if len(config["webapp"].get("helper", [])) != 2:
        raise ValueError("WebApp helper requires two customer-facing lines")
    if len(config["categories"]) != 5 or len(config["intensities"]) != 3:
        raise ValueError("Expected five categories and three intensities")
    if not REQUIRED_PALETTE_KEYS.issubset(config["palette"]):
        raise ValueError("Customer palette is incomplete")
    files = config["files"]
    if files.get("startHere") != "01_START-HERE_Play-Spill-or-Sip.pdf":
        raise ValueError("Unexpected START-HERE filename")
    if files.get("quickStart") != "02_Spill-or-Sip_Quick-Start.pdf":
        raise ValueError("Unexpected Quick Start filename")
    if not 8 <= config["layout"].get("sectionGapMm", 0) <= 10:
        raise ValueError("Page 3 section gap must be 8–10 mm")
