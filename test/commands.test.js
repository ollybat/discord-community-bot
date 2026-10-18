import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(root, '..', 'index.js'), 'utf8');

test('every registered slash-command root has an interaction handler', () => {
  const names = [...source.matchAll(/new SlashCommandBuilder\(\)\.setName\('([^']+)'\)/g)].map((match) => match[1]);
  assert.ok(names.length > 0, 'no slash commands found');
  assert.equal(new Set(names).size, names.length, 'duplicate root command names');
  assert.ok(names.length <= 100, 'Discord permits at most 100 top-level slash commands');
  const dispatch = source.slice(source.indexOf('if (!i.isChatInputCommand()) return;'));
  const handled = new Set([...dispatch.matchAll(/i\.commandName\s*===\s*'([^']+)'/g)].map((match) => match[1]));
  for (const group of dispatch.matchAll(/\[([^\]]+)\]\.includes\(i\.commandName\)/g)) for (const item of group[1].matchAll(/'([^']+)'/g)) handled.add(item[1]);
  assert.deepEqual(names.filter((name) => !handled.has(name)), [], 'unhandled slash commands');
});
