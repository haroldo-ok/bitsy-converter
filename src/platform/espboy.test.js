import fs from 'promise-fs';

import worldObject from './example.json';

import {convertWorld} from './espboy';

const normalizeBlanks = s => s.replace(/\s+/g, ' ').trim();
const containsNormalized = (s1, s2) => normalizeBlanks(s1).includes(normalizeBlanks(s2));

it('generates image offsets correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		#define ofs_BLANK 0
		#define ofs_TIL_a 1
		#define ofs_TIL_b 2
		#define ofs_TIL_c 4
		#define ofs_TIL_d 5
		#define ofs_SPR_A 6
		#define ofs_SPR_a_1 8
		#define ofs_SPR_b 10
		#define ofs_ITM_0 11
	`)).toBe(true);
});

it('generates dialog IDs correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		#define DIALOG_ID_SPR_0 1
		#define DIALOG_ID_ITM_0 2
		#define DIALOG_ID_SPR_1 3
	`)).toBe(true);
});

it('generates ending IDs correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		#define ENDING_ID_0 1
	`)).toBe(true);
});

it('generates game title constant correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char gameTitle[] = "Your game's title here";
	`)).toBe(true);
});

it('generates sprite arrays correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		int room_0_sprites[] = {
			ofs_SPR_a_1, 8, 12, dialog_SPR_0,
			ofs_SPR_b, 10, 6, dialog_SPR_1
		};
	`)).toBe(true);
});

it('generates exit arrays correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char room_0_exits[] = {
		  7, 0, 7, 15, 1
		};

		char room_1_exits[] = {
		  7, 15, 7, 0, 0,
		  0, 11, 14, 11, 2
		};
	`)).toBe(true);
});

