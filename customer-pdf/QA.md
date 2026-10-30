# Customer PDF QA checklist

Automated checks:

- `python -m unittest customer-pdf/test_generator.py`
- Generate twice and compare hashes reported by the generator.
- Inspect `/URI` annotations in page one of both documents; CTA and visible URL
  must each target `https://spill-or-sip-girls-night.netlify.app/`.

Visual checks after Poppler rendering:

- START-HERE has one dark page, a legible URL, a dominant `PLAY NOW` CTA and a
  high-contrast QR code.
- Quick Start has four light pages, no clipping or broken glyphs, and footers
  inside the safe area.
- On Quick Start page 3, the section gaps after `SPICY` and `WILD` are 9 mm;
  `INTENSITY` and `SURPRISE ME` cannot touch the preceding cards.

Manual customer-device checks still required:

- Tap CTA and visible URL in a PDF viewer.
- Scan the QR code from a desktop screen.
- Tap the link from a phone PDF viewer.
