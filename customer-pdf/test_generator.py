"""Automated contract checks for the customer PDF generator."""
import sys
import tempfile
import unittest
from pathlib import Path

from pypdf import PdfReader

sys.path.insert(0, str(Path(__file__).resolve().parent))
from configuration import load_config  # noqa: E402
from generate import DEFAULT_CONFIG, generate  # noqa: E402
from qr import make_qr  # noqa: E402


class CustomerPdfGeneratorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = load_config(DEFAULT_CONFIG)
        cls.temporary = tempfile.TemporaryDirectory()
        cls.output = Path(cls.temporary.name)
        cls.first = generate(DEFAULT_CONFIG, cls.output)
        cls.start_path = cls.output / cls.config["files"]["startHere"]
        cls.quick_path = cls.output / cls.config["files"]["quickStart"]

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def test_config_loads_with_production_url_and_cta(self):
        self.assertEqual(self.config["webapp"]["url"], "https://spill-or-sip-girls-night.netlify.app/")
        self.assertEqual(self.config["webapp"]["cta"], "PLAY NOW")

    def test_expected_outputs_exist_with_exact_filenames(self):
        self.assertTrue(self.start_path.is_file())
        self.assertTrue(self.quick_path.is_file())
        self.assertEqual(self.start_path.name, "01_START-HERE_Play-Spill-or-Sip.pdf")
        self.assertEqual(self.quick_path.name, "02_Spill-or-Sip_Quick-Start.pdf")

    def test_page_counts(self):
        self.assertEqual(len(PdfReader(self.start_path).pages), 1)
        self.assertEqual(len(PdfReader(self.quick_path).pages), 4)

    def test_start_here_and_quick_start_have_production_link_annotations(self):
        url = self.config["webapp"]["url"]
        for path in (self.start_path, self.quick_path):
            annotations = PdfReader(path).pages[0].get("/Annots")
            self.assertIsNotNone(annotations)
            targets = [item.get_object()["/A"]["/URI"] for item in annotations]
            self.assertGreaterEqual(targets.count(url), 2)

    def test_qr_builder_uses_configured_url(self):
        qr = make_qr(self.config["webapp"]["url"])
        self.assertEqual(qr.target, self.config["webapp"]["url"])
        self.assertIsNotNone(qr.image)

    def test_expected_copy_and_page_three_sections_exist(self):
        start_text = PdfReader(self.start_path).pages[0].extract_text()
        quick_pages = PdfReader(self.quick_path).pages
        quick_text = "\n".join(page.extract_text() for page in quick_pages)
        page_three = quick_pages[2].extract_text()
        for phrase in ("PLAY NOW", "Opens instantly in your browser.", "No app download needed."):
            self.assertIn(phrase, start_text)
            self.assertIn(phrase, quick_text)
        for phrase in ("DATING", "SECRETS", "FUNNY", "CHAOS", "SPICY", "MILD", "BOLD", "WILD", "SURPRISE ME", "INTENSITY"):
            self.assertIn(phrase, page_three)
        self.assertIn("Night Highlights", quick_text)

    def test_retired_copy_is_absent(self):
        output_text = "\n".join(
            page.extract_text()
            for path in (self.start_path, self.quick_path)
            for page in PdfReader(path).pages
        )
        self.assertNotIn("Random Mix", output_text)
        self.assertNotIn("PLAY THE WEBAPP", output_text)

    def test_generation_is_byte_deterministic(self):
        second = generate(DEFAULT_CONFIG, self.output)
        self.assertEqual(self.first["outputs"], second["outputs"])
        for filename in self.first["outputs"]:
            self.assertTrue((self.output / filename).is_file())


if __name__ == "__main__":
    unittest.main()
