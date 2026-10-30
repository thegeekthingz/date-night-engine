"""Physical geometry and bounded prompt fitting, independent of any game."""
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.units import mm


def geometry(config, paper):
    page, card = config['page'], config['card']
    width, height = [value * mm for value in page['dimensionsMm'][paper]]
    cw, ch = card['widthMm'] * mm, card['heightMm'] * mm
    gx, gy = page['horizontalGutterMm'] * mm, page['verticalGutterMm'] * mm
    columns, rows = page['columns'], page['rows']
    if columns < 1 or rows < 1 or columns * rows != page['cardsPerPage']:
        raise ValueError('Invalid page grid')
    x = (width - columns * cw - (columns - 1) * gx) / 2
    y = (height - rows * ch - (rows - 1) * gy) / 2
    marks = config['cropMarks']
    reach = (marks['offsetMm'] + marks['lengthMm']) * mm
    if min(x, y, gx / 2, gy / 2) < reach + marks['lineWidthPt'] / 2:
        raise ValueError('Crop marks do not fit page margins/gutters')
    if card['paddingMm'] < card['safeAreaMm'] or min(cw, ch) <= 2 * card['paddingMm'] * mm:
        raise ValueError('Invalid safe area/padding')
    slots = [(x + col * (cw + gx), height - y - (row + 1) * ch - row * gy)
             for row in range(rows) for col in range(columns)]
    return (width, height), (cw, ch), slots


def wrap(text, font, size, width):
    lines, line = [], ''
    for word in text.split():
        if pdfmetrics.stringWidth(word, font, size) > width:
            return None
        candidate = f'{line} {word}' if line else word
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            lines.append(line)
            line = word
    return lines + [line]


def fit_prompt(text, config):
    front, card = config['front'], config['card']
    width = (card['widthMm'] - 2 * card['paddingMm']) * mm
    height = front['promptBoxHeightMm'] * mm
    size = min(front['promptFontTargetPt'], front['promptFontMaxPt'])
    while size >= front['promptFontMinPt']:
        lines = wrap(text, 'Prompt', size, width)
        if lines and len(lines) * size * front['promptLineHeight'] <= height:
            return size, lines
        size -= 0.5
    raise ValueError(f'Prompt overflow at minimum font size: {text}')
