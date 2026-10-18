export function validatePollInput(question, options) {
  const cleanQuestion = String(question ?? '').trim();
  if (!cleanQuestion) throw new Error('A poll question is required.');
  if (cleanQuestion.length > 250) throw new Error('Poll questions must be 250 characters or fewer.');
  if (!Array.isArray(options) || options.length < 2 || options.length > 4) throw new Error('Polls need between 2 and 4 choices.');
  const cleanOptions = options.map((option) => String(option ?? '').trim());
  if (cleanOptions.some((option) => !option)) throw new Error('Poll choices cannot be empty.');
  if (cleanOptions.some((option) => option.length > 100)) throw new Error('Poll choices must be 100 characters or fewer.');
  if (new Set(cleanOptions.map((option) => option.toLocaleLowerCase())).size !== cleanOptions.length) throw new Error('Poll choices must be unique.');
  return { question: cleanQuestion, options: cleanOptions };
}

export function castPollVote(poll, userId, optionIndex) {
  if (!poll || typeof poll !== 'object') throw new Error('Poll not found.');
  if (poll.closed) throw new Error('Voting is closed for this poll.');
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= poll.options.length) throw new Error('That poll choice is invalid.');
  if (typeof userId !== 'string' || !userId.trim()) throw new Error('A valid voter is required.');
  poll.votes ??= {};
  const previous = poll.votes[userId];
  poll.votes[userId] = optionIndex;
  return { changed: previous !== optionIndex, previous };
}

export function pollTallies(poll) {
  const totals = (poll?.options ?? []).map(() => 0);
  for (const vote of Object.values(poll?.votes ?? {})) if (Number.isInteger(vote) && vote >= 0 && vote < totals.length) totals[vote] += 1;
  return totals;
}
