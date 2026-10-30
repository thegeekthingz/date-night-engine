import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/data/defaultGame.ts';
import { loadCardPack } from '../src/engine/gameLoader.ts';
import { getEligibleCards, selectCard } from '../src/engine/cardSelector.ts';

const { cards, manifest } = loadDefaultGame();
const categories = ['dating', 'secrets', 'funny', 'chaos', 'spicy'];
const intensities = ['mild', 'spicy', 'wild'];
const options = { selectedCategoryIds: [], selectedIntensities: [], playedCardIds: [], allowRepeats: false };

test('runtime production payload is identical to the frozen export and passes schema validation', async () => {
  const runtime = await readFile('src/data/cards/spill-or-sip-girls-night.json', 'utf8');
  const frozen = await readFile('docs/content/exports/spill-or-sip-girls-night-125-cards-v1.2.json', 'utf8');
  assert.equal(runtime, frozen);
  assert.equal(loadCardPack(JSON.parse(runtime)).length, 125);
});

test('production manifest preserves free play, filters, and only SPILL/SIP actions', () => {
  assert.equal(manifest.id, 'spill-or-sip-girls-night');
  assert.equal(manifest.turnMode, 'none');
  assert.deepEqual(manifest.categories.map(category => category.id), categories);
  assert.deepEqual(manifest.actions, [{ id: 'spill', label: 'SPILL' }, { id: 'sip', label: 'SIP' }]);
  assert.equal(manifest.intensityEnabled, true);
  assert.deepEqual(manifest.allowedIntensities, intensities);
  for (const field of ['allowRepeats', 'timerEnabled', 'scoringEnabled']) assert.equal(manifest[field], false);
});

test('125 unique active prompts have valid taxonomy, targets, actions, and no test media', () => {
  assert.equal(cards.length, 125);
  assert.equal(new Set(cards.map(card => card.id)).size, 125);
  assert.equal(new Set(cards.map(card => card.text)).size, 125);
  for (const card of cards) {
    assert.equal(card.active, true, card.id);
    assert.ok(card.text.trim(), card.id);
    assert.ok(categories.includes(card.categoryId), card.id);
    assert.ok(intensities.includes(card.intensity), card.id);
    assert.deepEqual(card.target, { type: 'none' });
    assert.deepEqual(card.actionIds, ['spill', 'sip']);
    assert.equal(card.actionIds.includes('skip'), false);
    assert.ok(card.actionIds.every(id => manifest.actions.some(action => action.id === id)));
    assert.ok(manifest.categories.some(category => category.id === card.categoryId));
    assert.equal(card.media, undefined);
  }
  assert.deepEqual(intensities.map(level => cards.filter(card => card.intensity === level).length), [39, 55, 31]);
});

for (const category of categories) {
  test(`production ${category} filter returns exactly its 25 cards`, () => {
    const eligible = getEligibleCards(cards, { ...options, selectedCategoryIds: [category] });
    assert.equal(eligible.length, 25);
    assert.ok(eligible.every(card => card.categoryId === category));
  });
}

for (const levels of [...intensities.map(level => [level]), ['mild', 'wild']]) {
  test(`production intensity filter: ${levels.join(' + ')}`, () => {
    const eligible = getEligibleCards(cards, { ...options, selectedIntensities: levels });
    assert.deepEqual(eligible, cards.filter(card => levels.includes(card.intensity)));
    assert.ok(eligible.length > 0);
  });
}

test('every category/intensity combination exhausts without repeats or mutating the pack', () => {
  const original = structuredClone(cards);
  for (const category of categories) for (const intensity of intensities) {
    const filtered = { ...options, selectedCategoryIds: [category], selectedIntensities: [intensity], playedCardIds: [] };
    const expected = cards.filter(card => card.categoryId === category && card.intensity === intensity);
    assert.ok(expected.length > 0);
    assert.deepEqual(getEligibleCards(cards, filtered), expected);
    for (let remaining = expected.length; remaining > 0; remaining--) {
      assert.equal(getEligibleCards(cards, filtered).length, remaining);
      const selected = selectCard(cards, filtered, () => 0.5);
      assert.ok(!filtered.playedCardIds.includes(selected.id));
      filtered.playedCardIds.push(selected.id);
      assert.ok(getEligibleCards(cards, filtered).every(card => card.id !== selected.id));
    }
    assert.equal(selectCard(cards, filtered), null);
  }
  assert.deepEqual(cards, original);
});
