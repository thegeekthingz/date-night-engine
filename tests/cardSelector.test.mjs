import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getEligibleCards, selectCard } from '../src/engine/cardSelector.ts';
import { loadDefaultGame } from '../src/data/defaultGame.ts';

const cards = [
  { id: 'a', text: 'A', categoryId: 'one', intensity: 'mild', type: 'question', active: true },
  { id: 'b', text: 'B', categoryId: 'two', intensity: 'spicy', type: 'question', active: true },
  { id: 'c', text: 'C', categoryId: 'one', intensity: 'wild', type: 'question', active: true },
  { id: 'd', text: 'D', categoryId: 'one', intensity: 'mild', type: 'question', active: false },
];
const options = {
  selectedCategoryIds: [], selectedIntensities: [], playedCardIds: [], allowRepeats: false,
};
const ids = pack => pack.map(card => card.id);

test('filters by selected category IDs', () => {
  const filter = { ...options, selectedCategoryIds: ['two'] };
  assert.deepEqual(ids(getEligibleCards(cards, filter)), ['b']);
  assert.equal(selectCard(cards, filter, () => 0).id, 'b');
  assert.deepEqual(ids(getEligibleCards(cards, { ...options, selectedCategoryIds: ['one', 'two'] })), ['a', 'b', 'c']);
});

test('filters by selected intensity levels', () => {
  const filter = { ...options, selectedIntensities: ['spicy', 'wild'] };
  assert.deepEqual(ids(getEligibleCards(cards, filter)), ['b', 'c']);
  assert.equal(selectCard(cards, filter, () => 0).id, 'b');
});

test('combines category and intensity restrictions', () => {
  const filter = { ...options, selectedCategoryIds: ['one'], selectedIntensities: ['wild'] };
  assert.equal(selectCard(cards, filter, () => 0).id, 'c');
});

test('empty filter lists allow all active categories and intensities', () => {
  assert.deepEqual(ids(getEligibleCards(cards, options)), ['a', 'b', 'c']);
});

test('inactive cards are excluded even when repeats are allowed', () => {
  assert.equal(selectCard([cards[3]], { ...options, allowRepeats: true }), null);
});

test('played IDs are excluded, including multiple records with the same ID', () => {
  const filter = { ...options, playedCardIds: ['a', 'unknown'] };
  assert.deepEqual(ids(getEligibleCards([...cards, { ...cards[0] }], filter)), ['b', 'c']);
  assert.equal(selectCard(cards, filter, () => 0).id, 'b');
});

test('allowRepeats permits played cards but preserves other filters', () => {
  const filter = {
    ...options, allowRepeats: true, playedCardIds: ['b'],
    selectedCategoryIds: ['two'], selectedIntensities: ['spicy'],
  };
  assert.equal(selectCard(cards, filter, () => 0).id, 'b');
  assert.equal(selectCard(cards, filter, () => 0).id, 'b');
});

test('selects each production card once, then stays exhausted', () => {
  const pack = loadDefaultGame().cards;
  const playedCardIds = [];
  for (let index = 0; index < pack.length; index++) {
    const card = selectCard(pack, { ...options, playedCardIds }, () => 0.5);
    assert.ok(card);
    assert.equal(playedCardIds.includes(card.id), false);
    playedCardIds.push(card.id);
  }
  assert.equal(playedCardIds.length, pack.length);
  assert.equal(new Set(playedCardIds).size, pack.length);
  assert.equal(selectCard(pack, { ...options, playedCardIds }), null);
  assert.equal(selectCard(pack, { ...options, playedCardIds }), null);
});

test('returns null for an empty pack, unmatched filters, or exhausted eligible subset', () => {
  assert.equal(selectCard([], options), null);
  assert.equal(selectCard(cards, { ...options, selectedCategoryIds: ['missing'] }), null);
  assert.equal(selectCard(cards, {
    ...options, selectedCategoryIds: ['one'], selectedIntensities: ['spicy'],
  }), null);
  assert.equal(selectCard(cards, {
    ...options, selectedCategoryIds: ['two'], playedCardIds: ['b'],
  }), null);
});

test('does not consume randomness when no eligible cards remain', () => {
  assert.equal(selectCard([], options, () => { throw Error('Must not run'); }), null);
});

test('random intervals select the first, middle, and last eligible cards', () => {
  for (const [value, expected] of [[0, 'a'], [0.32, 'a'], [1 / 3, 'b'], [0.5, 'b'], [2 / 3, 'c'], [0.999999, 'c']]) {
    let calls = 0;
    assert.equal(selectCard(cards, options, () => { calls++; return value; }).id, expected);
    assert.equal(calls, 1);
  }
});

test('rejects random values outside the documented range', () => {
  for (const value of [-0.1, 1, NaN, Infinity, -Infinity]) {
    assert.throws(() => selectCard(cards, options, () => value), RangeError);
  }
});

test('does not mutate the source array, card objects, filters, or history', () => {
  const pack = Object.freeze(cards.map(card => Object.freeze({ ...card })));
  const filter = Object.freeze({
    selectedCategoryIds: Object.freeze(['one']),
    selectedIntensities: Object.freeze(['mild', 'wild']),
    playedCardIds: Object.freeze(['a']),
    allowRepeats: false,
  });
  const before = structuredClone({ pack, filter });
  assert.equal(selectCard(pack, filter, () => 0), pack[2]);
  const eligible = getEligibleCards(pack, filter);
  eligible.pop();
  assert.deepEqual({ pack, filter }, before);
});
