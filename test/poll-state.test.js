import test from 'node:test';
import assert from 'node:assert/strict';
import { castPollVote, pollTallies, validatePollInput } from '../poll-state.js';

const makePoll = () => ({ options: ['Yes', 'No'], votes: {}, closed: false });

test('poll input trims values and rejects duplicate choices', () => {
  assert.deepEqual(validatePollInput('  Lunch?  ', [' Pizza ', ' Sushi ']), { question: 'Lunch?', options: ['Pizza', 'Sushi'] });
  assert.throws(() => validatePollInput('Pick', ['Same', ' same ']), /unique/);
  assert.throws(() => validatePollInput('Pick', ['Only one']), /between 2 and 4/);
});

test('votes are recorded once and a voter can change their selection', () => {
  const poll = makePoll();
  assert.deepEqual(castPollVote(poll, 'u1', 0), { changed: true, previous: undefined });
  assert.deepEqual(castPollVote(poll, 'u1', 1), { changed: true, previous: 0 });
  castPollVote(poll, 'u2', 1);
  assert.deepEqual(pollTallies(poll), [0, 2]);
});

test('closed polls and invalid choices cannot receive votes', () => {
  const poll = makePoll();
  assert.throws(() => castPollVote(poll, 'u1', 2), /invalid/);
  poll.closed = true;
  assert.throws(() => castPollVote(poll, 'u1', 0), /closed/);
});
