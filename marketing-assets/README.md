# Reusable Etsy Marketing Asset Generator foundation

This standalone Node foundation holds product content, visual tokens and slide
metadata separately from reusable HTML/CSS templates. It does not generate Etsy
images in this milestone, and it does not create fake screenshots or mockups.

## Validate the first product

```powershell
node marketing-assets/generate.mjs
node --test marketing-assets/tests/*.test.mjs
```

The validation command checks configuration structure and reports every missing
screenshot with its slide number, asset ID and expected path. A future rendering
milestone can use:

```powershell
node marketing-assets/generate.mjs --render
```

It intentionally refuses to render until every referenced asset is a real,
approved screenshot; the Playwright image-rendering step is not enabled yet.

## Add screenshots

Put approved screenshots in `marketing-assets/source/` using the exact names
listed in `marketing-assets/source/README.md`. Keep the config path relative to
the repository root. The templates receive screenshot paths from config only, so
inserting a real image never requires a template code change.

## Add a product

1. Copy `config/spill-or-sip-girls-night.etsy.json`.
2. Update product metadata, visual tokens, screenshot registry and slide copy.
3. Keep canvas dimensions at `2700 × 2025` and use only registered template names.
4. Run validation before introducing a rendering workflow.

## Add or edit a slide

Set a unique numeric `order`, output filename, supported `template`, copy object,
and screenshot IDs. Add a template module only when an existing foundation type
cannot express the layout; register it in `templates/index.mjs`.
