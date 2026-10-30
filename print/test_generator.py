import copy
import io
import json
import re
import unittest

from pypdf import PdfReader
from reportlab.lib.units import mm
from content import load_cards, validate_cards
from configuration import validate_config
from generate import DEFAULT_CONFIG, ROOT, register_fonts, render
from layout import fit_prompt, geometry


class PrintableTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads(DEFAULT_CONFIG.read_text())
        register_fonts(ROOT, cls.config)
        cls.cards = load_cards(ROOT, cls.config)

    def test_frozen_source_matches_runtime(self):
        runtime = json.loads((ROOT / 'src/data/cards/spill-or-sip-girls-night.json').read_text())
        lookup = {card['id']: card for card in runtime}
        self.assertEqual(len(self.cards), 125)
        for card in self.cards:
            other = lookup[card['id']]
            self.assertEqual((card['text'], card['category'], card['intensity']),
                             (other['text'], other['categoryId'], other['intensity']))

    def test_invalid_content_fails_without_mutation(self):
        for field, value in [('id', self.cards[1]['id']), ('print_order', '2'),
                             ('text', ''), ('category', 'unknown'), ('intensity', 'bold'),
                             ('active', 'False'), ('printable', 'False')]:
            with self.subTest(field=field):
                cards = copy.deepcopy(self.cards)
                cards[0][field] = value
                before = copy.deepcopy(cards)
                with self.assertRaises(ValueError):
                    validate_cards(cards, self.config)
                self.assertEqual(cards, before)
        with self.assertRaises(ValueError):
            validate_cards(self.cards[:-1], self.config)

    def test_order_is_explicit_not_array_position(self):
        shuffled = list(reversed(self.cards))
        self.assertEqual(validate_cards(shuffled, self.config), self.cards)
        self.assertEqual(shuffled[0], self.cards[-1])

    def test_labels_preserve_internal_values(self):
        self.assertEqual(self.config['intensityLabels'], {'mild': 'Mild', 'spicy': 'Bold', 'wild': 'Wild'})
        self.assertEqual(self.config['categoryLabels']['spicy'], 'Spicy')
        self.assertEqual(sum(card['intensity'] == 'spicy' for card in self.cards), 55)

    def test_release_config_rejects_unsupported_options(self):
        validate_config(self.config)
        for section, key, value in [('back', 'enabled', True), ('front', 'promptFontMinPt', 14),
                                     ('front', 'renderRuntimeMedia', True)]:
            config = copy.deepcopy(self.config)
            config[section][key] = value
            with self.assertRaises(ValueError):
                validate_config(config)

    def test_invalid_geometry_and_overflow_fail(self):
        config = copy.deepcopy(self.config)
        config['page']['verticalGutterMm'] = 10
        with self.assertRaises(ValueError):
            geometry(config, 'LETTER')
        with self.assertRaises(ValueError):
            fit_prompt('too long ' * 200, self.config)

    def test_pdf_pages_numbering_prompts_dimensions_and_blank_slot(self):
        for paper, expected in [('A4', (210, 297)), ('LETTER', (215.9, 279.4))]:
            data, fitted = render(self.cards, self.config, paper)
            reader = PdfReader(io.BytesIO(data))
            self.assertEqual(len(reader.pages), 14)
            numbers = []
            for index, page in enumerate(reader.pages):
                self.assertAlmostEqual(float(page.mediabox.width) / mm, expected[0], places=3)
                self.assertAlmostEqual(float(page.mediabox.height) / mm, expected[1], places=3)
                text = page.extract_text()
                found = re.findall(r'\b(\d{3})/125\b', text)
                self.assertEqual(len(found), 8 if index == 13 else 9)
                numbers.extend(found)
                for card in self.cards[index * 9:(index + 1) * 9]:
                    self.assertIn(' '.join(card['text'].split()), ' '.join(text.split()))
            self.assertEqual(numbers, [f'{i:03d}' for i in range(1, 126)])
            self.assertGreaterEqual(min(size for size, _ in fitted), 15)
            _, (cw, ch), _ = geometry(self.config, paper)
            self.assertAlmostEqual(cw / mm, 63.5)
            self.assertAlmostEqual(ch / mm, 88.9)
            # No artwork or text is emitted for the ninth slot on the last page.
            content = reader.pages[-1].get_contents().get_data()
            self.assertEqual(content.count(b' re f'), 8)  # one light face per card; no ninth face

    def test_visual_mapping_fonts_and_safe_header(self):
        from reportlab.pdfbase import pdfmetrics
        styles = self.config['front']['categoryVisuals']
        self.assertEqual({k: v['icon'] for k, v in styles.items()},
                         dict(dating='heart', secrets='lock', funny='smile', chaos='bolt', spicy='flame'))
        self.assertEqual(len({v['accent'] for v in styles.values()}), 5)
        front = self.config['front']
        available = (63.5 - 12) * mm
        for label in self.config['categoryLabels'].values():
            self.assertLess(15 + pdfmetrics.stringWidth(label.upper(), 'Label', 9) +
                            pdfmetrics.stringWidth('Bold', 'Label', 9) + 8, available)
        for paper in ['A4', 'LETTER']:
            data, _ = render(self.cards, self.config, paper)
            for page in PdfReader(io.BytesIO(data)).pages:
                fonts = page['/Resources']['/Font'].get_object()
                embedded = [font.get_object().get('/FontDescriptor') for font in fonts.values()]
                self.assertGreaterEqual(sum(bool(d and '/FontFile2' in d.get_object()) for d in embedded), 2)

    def test_byte_determinism_and_media_ignored(self):
        for paper in ['A4', 'LETTER']:
            self.assertEqual(render(self.cards, self.config, paper)[0], render(self.cards, self.config, paper)[0])
        first, _ = render(self.cards, self.config, 'A4')
        second, _ = render(self.cards, self.config, 'A4')
        self.assertEqual(first, second)
        cards = copy.deepcopy(self.cards)
        cards[0]['media'] = [{'src': 'https://example.invalid/no-download'}]
        self.assertEqual(first, render(cards, self.config, 'A4')[0])


if __name__ == '__main__':
    unittest.main()
