"""Run from any directory: python print/generate.py [--config PATH]."""
import argparse
import hashlib
import io
import json
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

from content import load_cards
from configuration import validate_config
from layout import fit_prompt, geometry
from icons import draw_icon

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / 'print/config/spill-or-sip-girls-night.print.json'


def register_fonts(root, config):
    for name, path in config['front']['fonts'].items():
        pdfmetrics.registerFont(TTFont(name, str(root / path)))


def crop_marks(canvas, x, y, width, height, settings):
    if not settings['enabled']:
        return
    gap, length = settings['offsetMm'] * mm, settings['lengthMm'] * mm
    canvas.setStrokeColor(HexColor(settings['color']))
    canvas.setLineWidth(settings['lineWidthPt'])
    for cx, sx in [(x, -1), (x + width, 1)]:
        for cy, sy in [(y, -1), (y + height, 1)]:
            canvas.line(cx + sx * gap, cy, cx + sx * (gap + length), cy)
            canvas.line(cx, cy + sy * gap, cx, cy + sy * (gap + length))


def draw_card(canvas, card, config, x, y, dimensions, fitted):
    width, height = dimensions
    front, palette = config['front'], config['front']['palette']
    padding = config['card']['paddingMm'] * mm
    canvas.setFillColor(HexColor(palette['background']))
    canvas.rect(x, y, width, height, fill=1, stroke=0)
    style = front['categoryVisuals'][card['category']]
    accent = HexColor(style['accent'])
    canvas.setStrokeColor(accent)
    canvas.setLineWidth(1.2)
    canvas.line(x + padding, y + height - padding, x + width - padding, y + height - padding)
    header_y = y + height - padding - front['headerBaselineMm'] * mm
    draw_icon(canvas, style['icon'], x + padding, header_y - 1, 11, accent)
    canvas.setFont('Label', front['labelFontPt'])
    canvas.setFillColor(HexColor(palette['text']))
    canvas.drawString(x + padding + 15, header_y, config['categoryLabels'][card['category']].upper())
    canvas.setFillColor(HexColor(palette['muted']))
    canvas.drawRightString(x + width - padding, header_y, config['intensityLabels'][card['intensity']])
    canvas.setFillColor(HexColor(palette['text']))
    size, lines = fitted
    canvas.setFont('Prompt', size)
    line_height = size * front['promptLineHeight']
    center = y + height / 2
    baseline = center + (len(lines) - 1) * line_height / 2 - size * 0.35
    for line in lines:
        canvas.drawString(x + padding, baseline, line)
        baseline -= line_height
    canvas.setStrokeColor(HexColor(palette['muted']))
    canvas.setLineWidth(0.5)
    canvas.line(x + padding, y + padding + 12, x + width - padding, y + padding + 12)
    canvas.setFillColor(HexColor(palette['muted']))
    canvas.setFont('Label', front['footerFontPt'])
    canvas.drawString(x + padding, y + padding, config['product']['footerText'])
    canvas.drawRightString(x + width - padding, y + padding,
                          f"{int(card['print_order']):03d}/{config['validation']['expectedCardCount']}")
    crop_marks(canvas, x, y, width, height, config['cropMarks'])


def render(cards, config, paper):
    page_size, dimensions, slots = geometry(config, paper)
    fitted = [fit_prompt(card['text'], config) for card in cards]
    for card in cards:
        supported = pdfmetrics.getFont('Prompt').face.charToGlyph
        if any(ord(char) not in supported for char in card['text']):
            raise ValueError(f"Unsupported prompt character: {card['id']}")
    buffer = io.BytesIO()
    canvas = Canvas(buffer, pagesize=page_size, invariant=1, pageCompression=1)
    canvas.setTitle(f"{config['product']['title']} - {config['product']['edition']} - {paper}")
    canvas.setAuthor(config['product']['title'])
    for start in range(0, len(cards), len(slots)):
        for index, card in enumerate(cards[start:start + len(slots)]):
            draw_card(canvas, card, config, *slots[index], dimensions, fitted[start + index])
        canvas.showPage()
    canvas.save()
    return buffer.getvalue(), fitted


def generate(config_path=DEFAULT_CONFIG):
    config = json.loads(Path(config_path).read_text(encoding='utf-8'))
    validate_config(config)
    register_fonts(ROOT, config)
    cards = load_cards(ROOT, config)
    # Validate and render every output before writing any deliverable.
    outputs = {paper: render(cards, config, paper) for paper in config['page']['supportedSizes']}
    destination = ROOT / config['output']['directory']
    destination.mkdir(parents=True, exist_ok=True)
    report = {'cards': len(cards), 'ids': [card['id'] for card in cards], 'outputs': {}}
    for paper, (data, fitted) in outputs.items():
        filename = config['output']['files'][paper]
        (destination / filename).write_bytes(data)
        report['outputs'][paper] = {'file': filename, 'bytes': len(data),
            'pages': (len(cards) + config['page']['cardsPerPage'] - 1) // config['page']['cardsPerPage'],
            'fontMinPt': min(size for size, _ in fitted), 'fontMaxPt': max(size for size, _ in fitted),
            'sha256': hashlib.sha256(data).hexdigest()}
    (destination / 'validation-report.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', type=Path, default=DEFAULT_CONFIG)
    args = parser.parse_args()
    print(json.dumps(generate(args.config), indent=2))
