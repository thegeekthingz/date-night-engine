# Printable generator v0.10

Independent local Python tool; it is not imported into the WebApp or deployed.
Python 3.10+ is required. Install the pinned print-only dependencies:

```sh
python -m pip install -r print/requirements.txt
python -m unittest discover -s print -p "test_*.py"
python print/generate.py
```

Optional: `python print/generate.py --config path/to/product.print.json`.
Paths in config are relative to the repository root, irrespective of shell cwd.

Outputs (run generation **after** the WebApp build, which clears `dist/`):

- `dist/printable/04_Spill-or-Sip_Printable_US-Letter.pdf`
- `dist/printable/03_Spill-or-Sip_Printable_A4.pdf`
- `dist/printable/validation-report.json` (QA only; not a customer deliverable)

US Letter is listed first commercially; package numbering remains 03=A4, 04=Letter.
Generated files are ignored by Git. No deployment configuration changes are needed.

## Sources and decisions

The approved external PRINTABLE_SPEC and PRINTABLE_GENERATOR_CONFIG_SPEC define the
contract. The supplied product JSON is preserved in `config/` with these explicit
implementation additions: CSV adapter/path (the runtime JSON has no print_order),
category counts/labels, Mild/Bold/Wild mapping, exact paper dimensions, font paths,
palette and the previously qualitative layout details. All supplied numeric
card/grid/gutter/font-range parameters and final filenames remain unchanged.

Frozen v1.2 CSV supplies every prompt, ID, category, intensity and print_order.
No content is rewritten or manually duplicated. Validation rejects missing cards,
invalid categories/intensities, inactive/non-printable cards and invalid order.
The tests compare all prompts, categories and intensities with the runtime deck.

Layout: centered 3x3 poker cards, 2.5 mm gutters, 6 mm padding, 4 mm safe area;
53 mm prompt box centered vertically, 20 pt target with 0.5 pt fitting steps down
to the configured 15 pt floor; overflow/unsupported glyphs fail generation.
Vera regular/bold are embedded; their redistribution license is included.
Labels use 9 pt, footer 7.5 pt. Small pink accent and blush badges share one layout.
Crop marks: 0.25 pt muted plum, 0.4 mm offset, 0.7 mm length, outside artwork.
Marks are deliberately short to fit half of the 2.5 mm gutter without crossing.
Palette follows the print spec suggestions: #F7EAF1, #26121F, #FF3F95, #6D4B5E;
badge blush #FFD8E8 follows the milestone palette. Media is never fetched/rendered.

Same config/content/fonts and pinned dependencies produce byte-identical PDFs.
All outputs are rendered successfully in memory before any PDF is written.
The final slot contains no artwork, prompt or marks of its own.

The release supports fronts-only. Back/duplex fields are reserved and disabled;
enabling them fails explicitly rather than producing an unvalidated duplex deck.
Other games can supply metadata, category distributions, labels, fonts, colors,
dimensions and order using the same CSV contract and template. Optional template
variants are not silently inferred from unsupported flags.

## Physical QA still pending

The Letter layout has only 3.85 mm top/bottom page margin before crop marks.
Printer non-printable margins vary: test at Actual Size / 100%, not Fit to Page.
Check one sheet per paper size, long prompts, all intensity labels and cut accuracy
before customer release. No physical-printer or duplex validation is claimed.
