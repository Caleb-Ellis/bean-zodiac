#!/usr/bin/env node
/**
 * Fortune editor helper.
 *
 * Usage:
 *   node scripts/edit-fortunes.mjs extract [glob]   -- dump fortune lines to stdout as JSON
 *   node scripts/edit-fortunes.mjs apply <json-file> -- write edited fortunes back to source files
 *
 * The JSON format is an array of objects:
 *   { file, field, original, edited }
 *
 * Workflow:
 *   1. node scripts/edit-fortunes.mjs extract '*adzuki*' > /tmp/fortunes.json
 *   2. Edit /tmp/fortunes.json (change "edited" values only)
 *   3. node scripts/edit-fortunes.mjs apply /tmp/fortunes.json
 */

import fs from 'fs';
import path from 'path';

const CONTENT_DIR = 'src/content/zodiacs';
const FORTUNE_FIELDS = [
  'fortuneMost', 'fortuneMost2',
  'fortuneHigh', 'fortuneHigh2',
  'fortuneMid', 'fortuneMid2',
  'fortuneLow', 'fortuneLow2',
  'fortuneLeast', 'fortuneLeast2',
];

const [,, cmd, arg] = process.argv;

if (cmd === 'extract') {
  const pattern = arg ?? '*';
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md') && new RegExp(pattern.replace('*', '.*')).test(f))
    .map(f => path.join(CONTENT_DIR, f))
    .sort();
  const rows = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const field of FORTUNE_FIELDS) {
      const match = content.match(new RegExp(`^${field}: (.+)$`, 'm'));
      if (match) {
        rows.push({ file, field, original: match[1], edited: match[1] });
      }
    }
  }

  process.stdout.write(JSON.stringify(rows, null, 2) + '\n');

} else if (cmd === 'apply') {
  const rows = JSON.parse(fs.readFileSync(arg, 'utf8'));
  const byFile = {};
  for (const row of rows) {
    (byFile[row.file] ??= []).push(row);
  }

  let changed = 0;
  for (const [file, edits] of Object.entries(byFile)) {
    let content = fs.readFileSync(file, 'utf8');
    let fileChanged = false;
    for (const { field, original, edited } of edits) {
      if (edited === original) continue;
      const before = content;
      content = content.replace(
        new RegExp(`^(${field}: )${escapeRegex(original)}$`, 'm'),
        `$1${edited}`
      );
      if (content !== before) { fileChanged = true; changed++; }
      else console.error(`WARN: could not find "${field}" in ${file}`);
    }
    if (fileChanged) fs.writeFileSync(file, content);
  }

  console.error(`Applied ${changed} changes.`);

} else {
  console.error('Usage: edit-fortunes.mjs extract [glob] | apply <json-file>');
  process.exit(1);
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
