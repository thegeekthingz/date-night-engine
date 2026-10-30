import type { Card } from '../types/card';
import type { SessionSlot } from '../types/session';

export const STAGES = {
  connect: { label: 'CONNECT', subtitle: 'A little closer', description: 'Take turns. Listen without rushing.', symbol: '01' },
  predict: { label: 'PREDICT', subtitle: 'How well do you know each other?', description: 'Make your guesses before you reveal.', symbol: '02' },
  play: { label: 'PLAY', subtitle: 'Make room for a little fun', description: 'There is no perfect answer. Just play along.', symbol: '03' },
  challenge: { label: 'CHALLENGE', subtitle: 'Try something together', description: 'Keep it light. Make it your own.', symbol: '04' },
  closer: { label: 'CLOSER', subtitle: 'End on a good note', description: 'One last moment, just for you two.', symbol: '05' },
};

// UI-only demonstration copy for the existing synthetic IDs, not a production pack.
// Non-fixture cards always display their own content verbatim. No metadata or IDs change.
const SAMPLES: Record<SessionSlot, string[]> = {
  connect: [
    'What is one small thing I do that makes your day better?',
    'Tell me about a moment with us you would happily live again.',
    'What would your ideal slow Sunday together look like?',
    'What is something you would love us to make more time for?',
    'What did you first notice about me that still makes you smile?',
    'Share a little dream you have not told me about yet.',
    'When do you feel most like yourself around me?',
    'What is one ordinary moment with us that feels special?'],
  predict: [
    'Guess each other’s perfect comfort meal. Keep your answers secret for a moment.',
    'Which of us would befriend a stranger on a train? Make your guesses.',
    'Guess the place your partner would pick for a surprise weekend away.',
    'What song would your partner choose for a kitchen dance? Guess first.',
    'Guess your partner’s choice: a mountain cabin or a little house by the sea?',
    'Which tiny luxury would your partner never give up? Make your guesses.',
    'Guess the movie your partner could watch a hundred times.',
    'Which of you would be better at planning a secret adventure? Guess first.'],
  play: [
    'Invent a three-word title for a movie about your life together.',
    'Build a ridiculous dream holiday, adding one detail each in turn.',
    'Describe your day using only three sounds. Let your partner translate.',
    'Take turns naming things that make a home feel like home.',
    'Create a tiny story together, one sentence at a time. Begin: “We missed the last train…”',
    'Give each other an imaginary job title based on your best everyday talent.',
    'Plan a dinner party with three fictional guests. Agree on who gets an invitation.',
    'Pitch each other the most wonderfully impractical date idea you can imagine.'],
  challenge: [
    'Find something nearby and turn it into an unexpected gift. Explain why you chose it.',
    'Give your partner a sincere compliment without using the word “you.”',
    'Choose a song together and make up a ten-second signature dance.',
    'Draw your ideal date in the air. See if your partner can guess it.',
    'Make each other smile without saying a word. Take turns trying.',
    'Give a thirty-second award speech celebrating your partner’s most underrated talent.',
    'Find three things nearby that could tell the story of your relationship.',
    'Invent a secret handshake together. Keep the final version.'],
  closer: [
    'Finish this sentence for each other: “Tonight, I loved…”',
    'Choose one small thing you would like to do together this week.',
    'Tell each other what you want to remember about this moment.',
    'Share one thing you are looking forward to, and make room for each other in it.',
    'Thank each other for something that might otherwise go unsaid.',
    'Give tonight a name. Something only the two of you would understand.',
    'Choose a little ritual you would like to make your own.',
    'End with one kind wish for each other’s tomorrow.'],
};
export function presentItem(card: Card, slot: SessionSlot) {
  if (!card.id.startsWith('fixture-') || !card.text.startsWith('Infrastructure fixture')) {
    return { prompt: card.text, reveal: card.revealText, sample: false };
  }
  const match = /^fixture-[a-z]+-(3|6)-(sweet|flirty)-(1|2)$/.exec(card.id);
  if (!match && !/^fixture-[1-5]$/.test(card.id)) return { prompt: card.text, reveal: card.revealText, sample: false };
  const index = match ? (match[1] === '6' ? 4 : 0) + (match[2] === 'flirty' ? 2 : 0) + (match[3] === '2' ? 1 : 0) : 0;
  return { prompt: SAMPLES[slot][index]!, sample: true,
    reveal: card.revealText?.trim() ? 'Share your guesses, then tell each other your real answer. What surprised you?' : undefined };
}
