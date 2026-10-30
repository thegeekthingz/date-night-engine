import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { loadDefaultGame } from '../src/legacy/data/defaultGame.ts';
import { advanceGame, consumeCard, createSetupSession, getPlayView, getSessionCardTotal, restoreShellSession, setupError, startGame } from '../src/legacy/engine/gameplayShell.ts';
import { endSession, restartSession, updateSessionSettings } from '../src/legacy/engine/sessionManager.ts';
import { createLocalStorageAdapter } from '../src/legacy/storage/localStorageAdapter.ts';
import { themeStyle } from '../src/theme/themeStyle.ts';
let server, SetupScreen, PlayScreen, EndScreen;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  SetupScreen = (await server.ssrLoadModule('/src/screens/SetupScreen.tsx')).default;
  PlayScreen = (await server.ssrLoadModule('/src/screens/PlayScreen.tsx')).default;
  EndScreen = (await server.ssrLoadModule('/src/screens/EndScreen.tsx')).default;
});
after(async () => { await server?.close(); });
const noop = () => {};

test('Setup separates eligible pool from selected length, shows caps and hides presets anonymously', async () => {
  const game = loadDefaultGame();
  let session = createSetupSession(game);
  const render = () => renderToStaticMarkup(createElement(SetupScreen, { game, session,
    error: setupError(session, game), onChange: noop, onStart: noop, onHome: noop }));
  assert.doesNotMatch(render(), /Game Length/);
  const names = count => Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Player ${i}` }));
  session = updateSessionSettings(session, { players: names(3) });
  assert.match(render(), /125 cards available in this vibe/);
  assert.match(render(), /4 turns each · 12 cards/);
  assert.match(render(), /name="session-length" checked=""/);
  assert.ok(render().indexOf('Game Length') > render().indexOf('Player names'));
  session = updateSessionSettings(session, { players: names(12), selectedIntensities: ['wild'], sessionLengthMode: 'long' });
  assert.match(render(), /31 cards available in this vibe/);
  assert.match(render(), /Up to 6 turns each · 31 cards available/);
  session = updateSessionSettings(session, { players: names(4), selectedCategoryIds: ['funny'] });
  assert.match(render(), /Only 4 cards match this vibe/);
  assert.doesNotMatch(render(), /type="submit" disabled/);
  session = updateSessionSettings(session, { selectedCategoryIds: [] });
  assert.match(render(), /type="submit" disabled/);
  const Selector = (await server.ssrLoadModule('/src/components/SessionLengthSelector.tsx')).default;
  let selected;
  const element = Selector({ selected: 'standard', playerCount: 3, eligibleCount: 125, onChange: value => { selected = value; } });
  element.props.children[2][0].props.children[0].props.onChange();
  assert.equal(selected, 'quick');
});

test('actual SPILL/SIP buttons rotate turns while Skip keeps the player; anonymous has no turn label', () => {
  const game = loadDefaultGame();
  let session = startGame(updateSessionSettings(createSetupSession(game), { players: [
    { id: 'p', name: 'Pamela' }, { id: 'j', name: 'Jessica' }, { id: 's', name: 'Sarah' },
  ] }), game, () => 0);
  for (const [label, expected] of [['SPILL', 'Jessica'], ['SIP', 'Sarah'], ['Skip this card', 'Sarah'], ['SPILL', 'Pamela']]) {
    const props = { manifest: game.manifest, view: getPlayView(session, game), playedCount: session.playedCardIds.length,
      totalCards: 125, onNext: () => { session = consumeCard(session, game, 'answer', () => 0); },
      onSkip: () => { session = consumeCard(session, game, 'skip', () => 0); }, onEnd: noop, onRestart: noop, onSetup: noop };
    const before = session.playedCardIds.length;
    const html = renderToStaticMarkup(createElement(PlayScreen, props));
    assert.match(html, /class="player-turn"/);
    assert.match(html, /aria-hidden="true"/);
    assert.doesNotMatch(html, /<button[^>]*>Next/);
    renderedButtons(createElement(PlayScreen, props)).find(button => button.props.children === label).props.onClick();
    assert.equal(getPlayView(session, game).currentPlayer.name, expected);
    assert.equal(session.playedCardIds.length, before + 1);
  }
  const anonymous = startGame(createSetupSession(game), game, () => 0);
  const html = renderToStaticMarkup(createElement(PlayScreen, { manifest: game.manifest, view: getPlayView(anonymous, game),
    playedCount: 1, totalCards: 125, onNext: noop, onSkip: noop, onEnd: noop, onRestart: noop, onSetup: noop }));
  assert.doesNotMatch(html, /class="player-turn"/);
});

test('Bold is a presentation label; selecting it filters and persists spicy', async () => {
  const game = loadDefaultGame();
  const IntensitySelector = (await server.ssrLoadModule('/src/components/IntensitySelector.tsx')).default;
  let selected = [];
  const selector = IntensitySelector({ levels: ['mild', 'spicy', 'wild'], selected,
    onChange: levels => { selected = levels; } });
  const boldChoice = selector.props.children[1][1];
  boldChoice.props.children[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(selected, ['spicy']);
  const setup = updateSessionSettings(createSetupSession(game), { selectedIntensities: selected });
  const html = renderToStaticMarkup(createElement(SetupScreen, {
    game, session: setup, onChange: noop, onStart: noop, onHome: noop,
  }));
  for (const label of ['Mild', 'Bold', 'Wild']) assert.ok(html.includes(`class="intensity-label">${label}</strong>`));
  assert.doesNotMatch(html, /class="intensity-label">[Ss]picy/);
  assert.match(html, /55 cards available in this vibe/);
  assert.match(html, /Spicy/); // The category retains its editorial label.
  const session = startGame(setup, game, () => 0);
  assert.equal(getPlayView(session, game).card.intensity, 'spicy');
  let stored = null;
  const storage = createLocalStorageAdapter(() => ({ getItem: () => stored,
    setItem: (_, value) => { stored = value; }, removeItem: () => { stored = null; } }));
  storage.saveSession(session);
  assert.deepEqual(restoreShellSession(game, storage.loadSession()), session);
  assert.equal(getSessionCardTotal(storage.loadSession(), game), 55);
  const playHtml = renderToStaticMarkup(createElement(PlayScreen, {
    manifest: game.manifest, view: getPlayView(session, game), playedCount: 1,
    totalCards: 55, onNext: noop, onSkip: noop, onEnd: noop, onRestart: noop, onSetup: noop,
  }));
  assert.match(playHtml, /class="intensity-label">Bold/);
});
test('approved theme maps configuration to CSS variables without mutation', () => {
  const game = loadDefaultGame();
  const before = structuredClone(game.theme);
  assert.equal(game.manifest.themeId, 'girls-night-hybrid-premium');
  assert.equal(game.theme.id, game.manifest.themeId);
  assert.equal(themeStyle(game.theme)['--primary'], '#FF3F95');
  assert.equal(themeStyle(game.theme)['--background'], '#160A13');
  assert.deepEqual(game.theme, before);
});
test('setup preserves semantic radios, checkboxes, optional names and disabled invalid start', () => {
  const game = loadDefaultGame();
  const html = renderToStaticMarkup(createElement(SetupScreen, { game, session: createSetupSession(game), error: 'Choose a category', onChange: noop, onStart: noop, onHome: noop }));
  assert.equal((html.match(/type="radio"/g) ?? []).length, 2);
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 8);
  assert.match(html, /Player names \(optional, one per line\)/);
  assert.match(html, /type="submit" disabled=""/);
  assert.match(html, /role="alert"/);
});
test('play exposes real deck progress, intensity, primary actions and separate navigation', () => {
  const game = loadDefaultGame();
  const session = startGame(createSetupSession(game), game, () => 0);
  const html = renderToStaticMarkup(createElement(PlayScreen, { manifest: game.manifest, view: getPlayView(session, game), playedCount: 1, totalCards: getSessionCardTotal(session, game), onNext: noop, onSkip: noop, onEnd: noop, onRestart: noop, onSetup: noop }));
  assert.match(html, /aria-label="Cards played" value="1" max="125"/);
  assert.match(html, /class="intensity-label">Mild/);
  assert.match(html, /primary-actions/);
  assert.match(html, />SPILL<|>SPILL/);
  assert.match(html, />SIP<|>SIP/);
  assert.match(html, /aria-label="Card navigation"/);
  assert.doesNotMatch(html, /<img|<video/);
});
test('end screen retains replay, setup, home controls and actual count', () => {
  const html = renderToStaticMarkup(createElement(EndScreen, { playedCount: 17, onAgain: noop, onSetup: noop, onHome: noop }));
  for (const copy of ['That was juicy.', '17', 'Play Again', 'Change Vibe', 'Back to Home']) assert.ok(html.includes(copy));
});


// Resolve these stateless presentation components to exercise their actual click props.
function renderedButtons(element) {
  if (!element || typeof element !== 'object') return [];
  if (Array.isArray(element)) return element.flatMap(renderedButtons);
  if (typeof element.type === 'function') return renderedButtons(element.type(element.props));
  return element.type === 'button' ? [element] : renderedButtons(element.props?.children);
}
function playButtons(game, session, advance) {
  return renderedButtons(createElement(PlayScreen, {
    manifest: game.manifest, view: getPlayView(session, game),
    playedCount: session.playedCardIds.length, totalCards: getSessionCardTotal(session, game),
    onNext: advance, onSkip: advance, onEnd: noop, onRestart: noop, onSetup: noop,
  }));
}

for (const label of ['SPILL', 'SIP', 'Skip this card']) {
  test(`${label} advances once, retains history, never repeats, and restores after each action`, () => {
    const game = loadDefaultGame();
    game.cards = game.cards.filter(card => card.categoryId === 'funny' && card.intensity === 'wild');
    let session = startGame(createSetupSession(game), game, () => 0);
    let calls = 0;
    let stored = null;
    const storage = createLocalStorageAdapter(() => ({
      getItem: () => stored, setItem: (_, value) => { stored = value; }, removeItem: () => { stored = null; },
    }));
    const advance = () => { calls++; session = advanceGame(session, game, () => 0); };
    while (!getPlayView(session, game).exhausted) {
      const previous = structuredClone(session);
      const beforeCalls = calls;
      const buttons = playButtons(game, session, advance);
      assert.ok(!buttons.some(button => String(button.props.children).startsWith('Next')));
      const action = buttons.find(button => button.props.children === label);
      assert.ok(action && !action.props.disabled);
      action.props.onClick();
      assert.equal(calls, beforeCalls + 1);
      assert.equal(session.playedCardIds.length, previous.playedCardIds.length + 1);
      assert.equal(getSessionCardTotal(session, game), game.cards.length);
      assert.ok(session.playedCardIds.includes(previous.currentCardId));
      assert.ok(!previous.playedCardIds.includes(session.currentCardId));
      assert.equal(new Set(session.playedCardIds).size, session.playedCardIds.length);
      storage.saveSession(session);
      const restored = restoreShellSession(game, storage.loadSession());
      assert.deepEqual(restored, session);
      assert.equal(getSessionCardTotal(restored, game), game.cards.length);
    }
    assert.equal(session.playedCardIds.length, game.cards.length);
    assert.ok(getPlayView(session, game).card);
    assert.equal(playButtons(game, session, advance).find(button => button.props.children === label).props.disabled, true);
    assert.deepEqual(advanceGame(session, game), session);
    game.manifest.endCondition = 'deck_complete';
    playButtons(game, session, advance).find(button => button.props.children === label).props.onClick();
    assert.equal(session.status, 'ended');
    assert.equal(session.playedCardIds.length, game.cards.length);
  });
}

test('Play renders Skip this card as secondary navigation with no visible Next button', () => {
  const game = loadDefaultGame();
  const session = startGame(createSetupSession(game), game, () => 0);
  const html = renderToStaticMarkup(createElement(PlayScreen, {
    manifest: game.manifest, view: getPlayView(session, game), playedCount: 1,
    totalCards: 125, onNext: noop, onSkip: noop, onEnd: noop, onRestart: noop, onSetup: noop,
  }));
  assert.match(html, /class="button-quiet"[^>]*>Skip this card<\/button>/);
  assert.doesNotMatch(html, /<button[^>]*>Next(?:\s|<)/);
});

for (const [name, patch, expected] of [
  ['all cards', {}, 125],
  ['wild only', { selectedIntensities: ['wild'] }, 31],
  ['category only', { selectedCategoryIds: ['dating'] }, 25],
  ['combined filters', { selectedCategoryIds: ['funny'], selectedIntensities: ['wild'] }, 4],
]) {
  test(`session total and rendered progress match ${name}`, () => {
    const game = loadDefaultGame();
    const setup = updateSessionSettings(createSetupSession(game), patch);
    let session = startGame(setup, game, () => 0);
    assert.equal(getSessionCardTotal(session, game), expected);
    session = advanceGame(session, game, () => 0);
    assert.equal(getSessionCardTotal(session, game), expected);
    const html = renderToStaticMarkup(createElement(PlayScreen, {
      manifest: game.manifest, view: getPlayView(session, game), playedCount: 2,
      totalCards: getSessionCardTotal(session, game), onNext: noop, onSkip: noop, onEnd: noop, onRestart: noop, onSetup: noop,
    }));
    assert.ok(html.includes(`value="2" max="${expected}"`));
    const restart = restartSession(session);
    assert.equal(getSessionCardTotal(restart, game), expected);
    assert.deepEqual(restart.playedCardIds, []);
  });
}

test('Setup count follows live selections; low count is non-blocking and zero cannot start', () => {
  const game = loadDefaultGame();
  let setup = createSetupSession(game);
  const render = () => renderToStaticMarkup(createElement(SetupScreen, {
    game, session: setup, error: setupError(setup, game), onChange: noop, onStart: noop, onHome: noop,
  }));
  assert.match(render(), /125 cards available in this vibe/);
  setup = updateSessionSettings(setup, { selectedCategoryIds: ['funny'], selectedIntensities: ['wild'] });
  assert.match(render(), /4 cards available in this vibe/);
  assert.match(render(), /Only 4 cards match this vibe/);
  assert.doesNotMatch(render(), /type="submit" disabled/);
  assert.equal(startGame(setup, game).status, 'playing');
  const inactive = structuredClone(game);
  inactive.cards.forEach(card => { card.active = false; });
  assert.equal(getSessionCardTotal(setup, inactive), 0);
  assert.throws(() => startGame(setup, inactive), /No cards match/);
  setup = updateSessionSettings(setup, { selectedCategoryIds: [] });
  assert.match(render(), /0 cards available in this vibe/);
  assert.match(render(), /type="submit" disabled/);
  assert.match(render(), /Choose at least one category/);
  assert.throws(() => startGame(setup, game), /category/);
});


test('session clarity copy follows presets, names, filters, caps and anonymous setup', () => {
  const game = loadDefaultGame();
  let session = createSetupSession(game);
  const names = count => Array.from({ length: count }, (_, i) => ({ id: String(i), name: `Player ${i}` }));
  const render = () => renderToStaticMarkup(createElement(SetupScreen, { game, session,
    error: setupError(session, game), onChange: noop, onStart: noop, onHome: noop }));
  const verify = (pool, target) => {
    const html = render();
    assert.ok(html.includes(`${pool} cards available in this vibe`));
    assert.ok(html.includes(`ALL ${pool} CARDS`));
    assert.ok(html.includes(target === pool ? `This session will use all ${pool} available cards.`
      : `This session will use ${target} of ${pool} available cards.`));
    assert.ok(html.includes(`START GAME · ${target} CARDS`));
  };
  session = updateSessionSettings(session, { players: names(3) });
  verify(125, 12);
  assert.match(render(), /Choose how long you want this session to be./);
  for (const [sessionLengthMode, target] of [['quick', 6], ['long', 18]]) {
    session = updateSessionSettings(session, { sessionLengthMode });
    verify(125, target);
  }
  session = updateSessionSettings(session, { selectedIntensities: ['wild'] });
  verify(31, 18);
  session = updateSessionSettings(session, { players: names(12) });
  verify(31, 31);
  assert.match(render(), /Up to 6 turns each · 31 cards available/);
  session = updateSessionSettings(session, { sessionLengthMode: 'all' });
  verify(31, 31);
  session = updateSessionSettings(session, { selectedCategoryIds: ['funny'] });
  verify(4, 4);
  session = updateSessionSettings(session, { selectedCategoryIds: [] });
  verify(0, 0);
  assert.match(render(), /type="submit" disabled/);
  session = updateSessionSettings(session, { players: [] });
  assert.doesNotMatch(render(), /Game Length|This session will use|START GAME ·/);
  assert.match(render(), /0 cards available in this vibe/);
});


test('Surprise Me hides filters, preserves manual choices and starts full pool with existing length rules', () => {
  const game = loadDefaultGame();
  let session = updateSessionSettings(createSetupSession(game), {
    selectedCategoryIds: ['dating', 'funny'], selectedIntensities: ['mild', 'spicy'],
    players: ['A', 'B', 'C'].map(name => ({ id: name, name })),
  });
  const manual = structuredClone(session);
  const render = () => renderToStaticMarkup(createElement(SetupScreen, { game, session,
    error: setupError(session, game), onChange: noop, onStart: noop, onHome: noop }));
  assert.match(render(), /<legend>Categories<\/legend>/);
  assert.match(render(), /<legend>Intensity<\/legend>/);
  session = updateSessionSettings(session, { modeId: 'random-mix' });
  assert.doesNotMatch(render(), /<legend>Categories|<legend>Intensity|Random Mix/);
  assert.match(render(), /Surprise Me/);
  assert.match(render(), /All 5 categories/);
  assert.match(render(), /Mild · Bold · Wild/);
  assert.match(render(), /125 cards available in this mix/);
  assert.match(render(), /This session will use 12 of 125 available cards/);
  assert.match(render(), /START GAME · 12 CARDS/);
  let stored;
  const storage = createLocalStorageAdapter(() => ({ getItem: () => stored ?? null,
    setItem: (_, text) => { stored = text; }, removeItem: () => { stored = null; } }));
  storage.saveSession(session);
  session = restoreShellSession(game, storage.loadSession());
  assert.equal(session.modeId, 'random-mix');
  assert.deepEqual(session.selectedCategoryIds, manual.selectedCategoryIds);
  const active = startGame(session, game, () => 0);
  assert.equal(active.effectiveTarget, 12);
  assert.deepEqual(active.selectedCategoryIds, game.manifest.categories.map(c => c.id));
  assert.deepEqual(active.selectedIntensities, ['mild', 'spicy', 'wild']);
  storage.saveSession(active);
  assert.deepEqual(restoreShellSession(game, storage.loadSession()), active);
  session = updateSessionSettings(restartSession(storage.loadSession()), { modeId: 'choose-your-vibe' });
  assert.deepEqual(session.selectedCategoryIds, manual.selectedCategoryIds);
  assert.deepEqual(session.selectedIntensities, manual.selectedIntensities);
  session = updateSessionSettings(session, { selectedCategoryIds: [], selectedIntensities: [] });
  assert.ok(setupError(session, game));
  session = updateSessionSettings(session, { modeId: 'random-mix', sessionLengthMode: 'all' });
  assert.equal(setupError(session, game), null);
  assert.equal(startGame(session, game).effectiveTarget, 125);
  session = updateSessionSettings(session, { players: [] });
  assert.doesNotMatch(render(), /Game Length/);
  assert.equal(getSessionCardTotal(startGame(session, game), game), 125);
});


test('Setup mobile polish exposes concise modes and associates player helper with textarea', () => {
  const game = loadDefaultGame();
  const session = createSetupSession(game);
  const html = renderToStaticMarkup(createElement(SetupScreen, { game, session,
    error: setupError(session, game), onChange: noop, onStart: noop, onHome: noop }));
  for (const copy of ['Choose Your Vibe', 'Pick categories + intensity', 'Surprise Me',
    'Mix everything for me', 'Add names for player turns and game length.']) assert.ok(html.includes(copy));
  assert.doesNotMatch(html, /Pick categories and intensity yourself|Game Length/);
  const helper = html.match(/<p class="player-helper" id="([^"]+)">/)[1];
  assert.ok(html.includes(`aria-describedby="${helper}"`));
});

test('End screen shows named stats and highlights, while anonymous stays simple', () => {
  const game = loadDefaultGame();
  const players = [{ id: 'pam', name: 'Pamela With A Very Long Name' }, { id: 'joy', name: 'Joy' }];
  let session = startGame(updateSessionSettings(createSetupSession(game), { players }), game, () => 0);
  session = consumeCard(session, game, 'spill', () => 0);
  session = consumeCard(session, game, 'sip', () => 0);
  session = endSession(session);
  const named = renderToStaticMarkup(createElement(EndScreen, {
    session, onAgain: noop, onSetup: noop, onHome: noop,
  }));
  assert.match(named, /<strong>2<\/strong> cards played/);
  assert.match(named, /Pamela With A Very Long Name/);
  assert.match(named, /1 Spill · 0 Sip · 0 Skip/);
  assert.match(named, /Night Highlights/);
  assert.match(named, /Queen of Sips|shared the Sip crown/);
  const anonymous = endSession(consumeCard(startGame(createSetupSession(game), game, () => 0), game, 'skip', () => 0));
  const plain = renderToStaticMarkup(createElement(EndScreen, {
    session: anonymous, onAgain: noop, onSetup: noop, onHome: noop,
  }));
  assert.match(plain, /<strong>1<\/strong> cards played/);
  assert.doesNotMatch(plain, /Player session stats|Night Highlights|Spill ·|Sip ·|Skip/);
});
