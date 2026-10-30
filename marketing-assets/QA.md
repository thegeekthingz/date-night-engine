# Marketing asset foundation QA

Run `node marketing-assets/generate.mjs` to validate the JSON and obtain the
clear missing-asset report. Run `node --test marketing-assets/tests/*.test.mjs`
to verify canvas size, unique slide order/output, template registry, future asset
resolvability and missing-asset behavior.

No Etsy listing images are rendered during this foundation milestone. Before a
future renderer is enabled, verify that every source file is a real approved
WebApp screenshot and that it belongs to the intended slide.
