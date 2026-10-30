# Customer PDF generator v0.11

This independent, config-driven Python tool creates the customer-delivery
START-HERE and Quick Start PDFs. It is not imported by, bundled into, or deployed
with the WebApp.

## Use

```powershell
python -m pip install -r customer-pdf/requirements.txt
python customer-pdf/generate.py
python -m unittest customer-pdf/test_generator.py
```

The default config is `customer-pdf/config/spill-or-sip-girls-night.customer.json`.
It supplies product copy, production URL, feature list, customer labels, palette,
layout tokens and the exact output filenames. Future games can use another config
without copying the ReportLab layout implementation.

Output files are written to `dist/customer-delivery/`:

- `01_START-HERE_Play-Spill-or-Sip.pdf` — one dark launcher page.
- `02_Spill-or-Sip_Quick-Start.pdf` — four light instruction pages.

The renderer uses ReportLab's invariant mode and fixed metadata. With identical
dependencies and config, repeated runs are byte-identical.

## QA

`test_generator.py` verifies the config, exact output names, page counts, link
annotations, QR construction from the configured URL, required copy, retired-copy
absence and deterministic repeated generation. Render the final PDFs with Poppler
for visual QA; do not keep render artifacts in `dist/customer-delivery/`.
