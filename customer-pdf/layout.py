"""Reusable ReportLab layout primitives and the two customer document templates."""
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import mm

from content import footer_label
from qr import make_qr


PAGE_WIDTH, PAGE_HEIGHT = LETTER


def color(config, name):
    return HexColor(config["palette"][name])


def wrap(canvas, text, font, size, max_width):
    words, lines, line = text.split(), [], ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if line and canvas.stringWidth(candidate, font, size) > max_width:
            lines.append(line)
            line = word
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def draw_wrapped(canvas, text, x, y, width, *, font="Helvetica", size=10, leading=None, fill=None):
    leading = leading or size * 1.38
    if fill is not None:
        canvas.setFillColor(fill)
    canvas.setFont(font, size)
    lines = wrap(canvas, text, font, size, width)
    for line in lines:
        canvas.drawString(x, y, line)
        y -= leading
    return y


def page_background(canvas, config, dark=False):
    canvas.setFillColor(color(config, "background" if dark else "lightSurface"))
    canvas.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, fill=1, stroke=0)


def page_header(canvas, config, title, subtitle=None, *, dark=False):
    margin = config["layout"]["marginMm"] * mm
    main = white if dark else color(config, "text")
    muted = color(config, "pinkSoft") if dark else color(config, "muted")
    canvas.setFillColor(main)
    canvas.setFont("Helvetica-Bold", 24)
    canvas.drawString(margin, PAGE_HEIGHT - margin, title.upper())
    y = PAGE_HEIGHT - margin - 25
    if subtitle:
        canvas.setFillColor(muted)
        canvas.setFont("Helvetica", 11)
        canvas.drawString(margin, y, subtitle)
        y -= 18
    canvas.setStrokeColor(color(config, "pink"))
    canvas.setLineWidth(2.5)
    canvas.line(margin, y, PAGE_WIDTH - margin, y)
    return y - 18


def section_title(canvas, config, text, x, y, *, dark=False):
    canvas.setFillColor(color(config, "pink") if dark else color(config, "coral"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(x, y, text.upper())
    return y - 16


def info_card(canvas, config, x, y_top, width, height, *, dark=False):
    canvas.setFillColor(color(config, "surface") if dark else white)
    canvas.setStrokeColor(color(config, "line"))
    canvas.setLineWidth(0.6)
    canvas.roundRect(x, y_top - height, width, height, 8, fill=1, stroke=1)
    return y_top - height


def bullet_row(canvas, config, text, x, y, width, *, dark=False, size=10):
    dot = color(config, "pink") if dark else color(config, "coral")
    fill = white if dark else color(config, "text")
    canvas.setFillColor(dot)
    canvas.circle(x + 3, y + 2, 2.2, fill=1, stroke=0)
    return draw_wrapped(canvas, text, x + 12, y + 5, width - 12, size=size, fill=fill) - 4


def link_annotation(canvas, url, x, y, width, height):
    canvas.linkURL(url, (x, y, x + width, y + height), relative=0, thickness=0)


def cta_button(canvas, config, x, y_top, width, *, dark=False):
    """Draw the deliberately tall, high-contrast customer CTA and add a link."""
    height = 48
    fill = color(config, "pink")
    label = color(config, "background")
    canvas.setFillColor(fill)
    canvas.roundRect(x, y_top - height, width, height, 10, fill=1, stroke=0)
    canvas.setFillColor(label)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawCentredString(x + width / 2, y_top - 29, config["webapp"]["cta"])
    link_annotation(canvas, config["webapp"]["url"], x, y_top - height, width, height)
    return y_top - height


def webapp_block(canvas, config, x, y_top, width, *, dark=False, show_qr=True):
    fill = white if dark else color(config, "text")
    url_fill = color(config, "pinkSoft") if dark else color(config, "muted")
    url = config["webapp"]["url"]
    cta_width = width - (80 if show_qr else 0)
    button_bottom = cta_button(canvas, config, x, y_top, cta_width, dark=dark)
    canvas.setFillColor(fill)
    canvas.setFont("Helvetica", 9.5)
    helper_y = button_bottom - 14
    for line in config["webapp"]["helper"]:
        canvas.drawString(x, helper_y, line)
        helper_y -= 12
    canvas.setFillColor(url_fill)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(x, helper_y - 2, url)
    link_annotation(canvas, url, x, helper_y - 7, cta_width, 15)
    bottom = helper_y - 20
    if show_qr:
        qr_size = 70
        qr_x, qr_y = x + width - qr_size, y_top - qr_size
        canvas.setFillColor(white)
        canvas.roundRect(qr_x - 3, qr_y - 3, qr_size + 6, qr_size + 6, 5, fill=1, stroke=0)
        canvas.drawImage(make_qr(url).image, qr_x, qr_y, qr_size, qr_size, mask="auto")
        bottom = min(bottom, qr_y - 4)
    return bottom


def footer(canvas, config, *, dark=False, page_label=None):
    margin = config["layout"]["marginMm"] * mm
    y = config["layout"]["footerMm"] * mm
    fill = color(config, "pinkSoft") if dark else color(config, "muted")
    canvas.setStrokeColor(color(config, "pink") if dark else color(config, "line"))
    canvas.setLineWidth(0.5)
    canvas.line(margin, y + 10, PAGE_WIDTH - margin, y + 10)
    canvas.setFillColor(fill)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawString(margin, y, footer_label(config))
    if page_label:
        canvas.drawRightString(PAGE_WIDTH - margin, y, page_label)


def labeled_card(canvas, config, title, description, x, y_top, width, *, accent_name="pink", height=39):
    info_card(canvas, config, x, y_top, width, height)
    canvas.setFillColor(color(config, accent_name))
    canvas.roundRect(x, y_top - height, 5, height, 4, fill=1, stroke=0)
    canvas.setFillColor(color(config, "text"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(x + 14, y_top - 14, title.upper())
    draw_wrapped(canvas, description, x + 14, y_top - 27, width - 25, size=8.5, fill=color(config, "muted"))
    return y_top - height


def render_start_here(canvas, config):
    page_background(canvas, config, dark=True)
    margin = config["layout"]["marginMm"] * mm
    y = page_header(canvas, config, config["product"]["title"], config["product"]["edition"], dark=True)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawString(margin, y, "READY TO PLAY?")
    y -= 28
    canvas.setFillColor(color(config, "pinkSoft"))
    canvas.setFont("Helvetica-Bold", 13)
    canvas.drawString(margin, y, "1 GAME · 2 WAYS TO PLAY")
    y -= 20
    y = draw_wrapped(canvas, "Play instantly on your phone or print the full game at home.", margin, y, PAGE_WIDTH - 2 * margin, size=11, fill=white) - 14
    y = section_title(canvas, config, "Play on your phone", margin, y, dark=True)
    y = webapp_block(canvas, config, margin, y, PAGE_WIDTH - 2 * margin, dark=True) - 10
    y = section_title(canvas, config, "Your download includes", margin, y, dark=True)
    for feature in config["features"]:
        y = bullet_row(canvas, config, feature, margin, y, PAGE_WIDTH - 2 * margin, dark=True, size=9.3)
    y -= 3
    canvas.setFillColor(color(config, "pinkSoft"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(margin, y, config["product"]["age"])
    y -= 15
    canvas.setFont("Helvetica", 9)
    canvas.drawString(margin, y, config["product"]["digitalNote"])
    y -= 14
    canvas.drawString(margin, y, f"Need help? {config['product']['support']}")
    footer(canvas, config, dark=True, page_label="START HERE · v1.0")
    canvas.showPage()


def render_quick_start_page_one(canvas, config):
    page_background(canvas, config)
    margin = config["layout"]["marginMm"] * mm
    y = page_header(canvas, config, "Quick Start", config["product"]["edition"])
    canvas.setFillColor(color(config, "text"))
    canvas.setFont("Helvetica-Bold", 16)
    canvas.drawString(margin, y, config["quickStart"]["tagline"])
    y -= 27
    y = section_title(canvas, config, "Play on your phone", margin, y)
    y = webapp_block(canvas, config, margin, y, PAGE_WIDTH - 2 * margin, show_qr=True) - 7
    y = section_title(canvas, config, "Prefer cards?", margin, y)
    y = draw_wrapped(canvas, config["print"]["summary"], margin, y, PAGE_WIDTH - 2 * margin, size=10, fill=color(config, "text")) - 12
    info_card(canvas, config, margin, y, PAGE_WIDTH - 2 * margin, 57)
    canvas.setFillColor(color(config, "text"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(margin + 12, y - 17, config["product"]["age"])
    canvas.setFont("Helvetica", 9.5)
    canvas.drawString(margin + 12, y - 31, "Alcohol is optional — use any drink or fun alternative your group prefers.")
    canvas.drawString(margin + 12, y - 44, config["product"]["digitalNote"])
    footer(canvas, config, page_label="QUICK START · 1 / 4")
    canvas.showPage()


def render_quick_start_page_two(canvas, config):
    page_background(canvas, config)
    margin = config["layout"]["marginMm"] * mm
    y = page_header(canvas, config, "How to Play", "Set the vibe, read the prompt and decide: SPILL or SIP.")
    for index, (title, description) in enumerate(config["quickStart"]["howToPlay"], start=1):
        card_height = 50 if index in (3, 4, 8) else 43
        info_card(canvas, config, margin, y, PAGE_WIDTH - 2 * margin, card_height)
        canvas.setFillColor(color(config, "pink"))
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(margin + 12, y - 15, f"{index}. {title.upper()}")
        draw_wrapped(canvas, description, margin + 12, y - 29, PAGE_WIDTH - 2 * margin - 24, size=8.6, fill=color(config, "muted"))
        y -= card_height + 5
    footer(canvas, config, page_label="QUICK START · 2 / 4")
    canvas.showPage()


def render_quick_start_page_three(canvas, config):
    page_background(canvas, config)
    margin = config["layout"]["marginMm"] * mm
    gap = config["layout"]["sectionGapMm"] * mm
    y = page_header(canvas, config, "Choose Your Vibe", "Combine categories and intensity levels for your group.")
    y = section_title(canvas, config, "Categories", margin, y)
    accents = ("pink", "coral", "pink", "coral", "pink")
    for (title, description), accent in zip(config["categories"], accents):
        y = labeled_card(canvas, config, title, description, margin, y, PAGE_WIDTH - 2 * margin, accent_name=accent) - 4
    y -= gap  # Deliberate 8–10 mm transition after SPICY before INTENSITY.
    y = section_title(canvas, config, "Intensity", margin, y)
    for title, tagline, description in config["intensities"]:
        y = labeled_card(canvas, config, title, f"{tagline} {description}", margin, y, PAGE_WIDTH - 2 * margin, accent_name="coral", height=42) - 4
    y -= gap  # Deliberate 8–10 mm transition after WILD before SURPRISE ME.
    y = section_title(canvas, config, "Surprise Me", margin, y)
    info_card(canvas, config, margin, y, PAGE_WIDTH - 2 * margin, 54)
    draw_wrapped(canvas, config["quickStart"]["surprise"], margin + 12, y - 16, PAGE_WIDTH - 2 * margin - 24, size=9, fill=color(config, "text"))
    footer(canvas, config, page_label="QUICK START · 3 / 4")
    canvas.showPage()


def render_quick_start_page_four(canvas, config):
    page_background(canvas, config)
    margin = config["layout"]["marginMm"] * mm
    y = page_header(canvas, config, "Print, Play & Good Vibes", "Everything you need for a great night in.")
    y = section_title(canvas, config, "Printing basics", margin, y)
    for item in config["print"]["basics"]:
        y = bullet_row(canvas, config, item, margin, y, PAGE_WIDTH - 2 * margin, size=9.6)
    y -= 5
    y = section_title(canvas, config, "Playing with printed cards", margin, y)
    printed_flow = "Shuffle the deck. Draw one card at a time. Read it aloud, then choose SPILL or SIP. If anyone wants to pass, move to the next card. Keep used cards in a separate pile so there are no repeats."
    y = draw_wrapped(canvas, printed_flow, margin, y, PAGE_WIDTH - 2 * margin, size=10, fill=color(config, "text")) - 12
    y = section_title(canvas, config, "Good vibes only", margin, y)
    y = draw_wrapped(canvas, "Anyone can skip a prompt — no explanations needed. The point is to have fun, not make anyone uncomfortable. SIP can mean any drink or fun alternative your group chooses.", margin, y, PAGE_WIDTH - 2 * margin, size=10, fill=color(config, "text")) - 12
    y = section_title(canvas, config, "Need help?", margin, y)
    canvas.setFillColor(color(config, "text"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(margin, y, "Start with 01_START-HERE_Play-Spill-or-Sip.pdf")
    canvas.setFont("Helvetica", 9.5)
    canvas.drawString(margin, y - 15, config["product"]["support"])
    footer(canvas, config, page_label="QUICK START · 4 / 4")
    canvas.showPage()


def render_quick_start(canvas, config):
    render_quick_start_page_one(canvas, config)
    render_quick_start_page_two(canvas, config)
    render_quick_start_page_three(canvas, config)
    render_quick_start_page_four(canvas, config)
