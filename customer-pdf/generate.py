"""Generate config-driven START-HERE and Quick Start customer PDFs."""
import argparse
import hashlib
import io
import json
from pathlib import Path

from reportlab.pdfgen.canvas import Canvas

from configuration import load_config
from content import customer_copy
from layout import PAGE_HEIGHT, PAGE_WIDTH, render_quick_start, render_start_here


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "customer-pdf/config/spill-or-sip-girls-night.customer.json"


def render_document(config, renderer, title):
    buffer = io.BytesIO()
    canvas = Canvas(buffer, pagesize=(PAGE_WIDTH, PAGE_HEIGHT), invariant=1, pageCompression=1)
    canvas.setTitle(title)
    canvas.setAuthor(config["product"]["brand"])
    canvas.setSubject(config["product"]["edition"])
    canvas.setCreator("Social Game Engine customer PDF generator")
    renderer(canvas, config)
    canvas.save()
    return buffer.getvalue()


def generate(config_path=DEFAULT_CONFIG, output_directory=None):
    config = customer_copy(load_config(config_path))
    destination = Path(output_directory) if output_directory else ROOT / config["files"]["outputDirectory"]
    start_here = render_document(config, render_start_here, f"{config['product']['title']} — START HERE")
    quick_start = render_document(config, render_quick_start, f"{config['product']['title']} — Quick Start")
    outputs = {
        config["files"]["startHere"]: start_here,
        config["files"]["quickStart"]: quick_start,
    }
    destination.mkdir(parents=True, exist_ok=True)
    for filename, data in outputs.items():
        (destination / filename).write_bytes(data)
    return {
        "destination": str(destination),
        "url": config["webapp"]["url"],
        "outputs": {filename: {"bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()} for filename, data in outputs.items()},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--output-directory", type=Path)
    args = parser.parse_args()
    print(json.dumps(generate(args.config, args.output_directory), indent=2))
