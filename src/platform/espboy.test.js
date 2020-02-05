import fs from 'promise-fs';

import worldObject from './example.json';

import {convertWorld} from './espboy';

const normalizeBlanks = s => s.replace(/\s+/g, ' ').trim();
const containsNormalized = (s1, s2) => normalizeBlanks(s1).includes(normalizeBlanks(s2));

it('generates image offsets correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	console.log(generatedCode);
	expect(containsNormalized(generatedCode, `
		todo todo todo todo
	`)).toBe(true);
});
