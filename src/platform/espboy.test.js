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

it('should not generate empty arrays', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		[] = { };
	`)).toBe(false);
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

it('generates ending arrays correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char room_2_endings[] = {
		  13, 11, ENDING_ID_0
		};
	`)).toBe(true);
});

it('generates arrays for individual room map data', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char room_0[] = {
		  0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0,
		  0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0,
		  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
		  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0,
		  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
		  0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0,
		  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
		  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		};
	`)).toBe(true);
});

it('generates general room array', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		int rooms[] = {
		  room_0, 2, room_0_sprites, 1, room_0_exits, 0, room_0_endings,
		  room_1, 0, room_1_sprites, 2, room_1_exits, 0, room_1_endings,
		  room_2, 0, room_2_sprites, 0, room_2_exits, 1, room_2_endings
		};
	`)).toBe(true);
});

it('generates tile information array', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char tileInfos[] = {
		  // BLANK
		  false, 1,
		  // TIL_a
		  true, 1,
		  // TIL_b
		  false, 2,
		  false, 2,
		  // TIL_c
		  false, 1,
		  // TIL_d
		  false, 1,
		  // SPR_A
		  false, 2,
		  false, 2,
		  // SPR_a_1
		  false, 2,
		  false, 2,
		  // SPR_b
		  false, 1,
		  // ITM_0
		  false, 1
		};
	`)).toBe(true);
});

it('generates individual image arrays', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		char image_BLANK_0[] = { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 };
		char image_TIL_a_0[] = { 0x11, 0x11, 0x11, 0x11, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x01, 0x10, 0x00, 0x00, 0x01, 0x10, 0x00, 0x00, 0x01, 0x11, 0x11, 0x11, 0x11 };
	`)).toBe(true);
});

it('generates main image arrays', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		int images[] = { 
		  image_BLANK_0,
		  image_TIL_a_0,
		  image_TIL_b_0,
		  image_TIL_b_1,
		  image_TIL_c_0,
		  image_TIL_d_0,
		  image_SPR_A_0,
		  image_SPR_A_1,
		  image_SPR_a_1_0,
		  image_SPR_a_1_1,
		  image_SPR_b_0,
		  image_ITM_0_0
		}
	`)).toBe(true);
});

it('generates individual dialog functions', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void dialog_SPR_0() {
		  showDialog("I'm a cat. Meow!");  
		}
	`)).toBe(true);
});

it('generates main dialog function', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void showChosenDialog(int dlgNumber) {
		  switch (dlgNumber) {

		  case DIALOG_ID_SPR_0:
			dialog_SPR_0();
			break;

		  case DIALOG_ID_ITM_0:
			dialog_ITM_0();
			break;

		  case DIALOG_ID_SPR_1:
			dialog_SPR_1();
			break;
          }
		}
	`)).toBe(true);
});


it('generates individual ending functions', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void ending_0() {
		  showDialog("This is the end.");  
		}
	`)).toBe(true);
});

it('generates main ending function', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void showChosenEnding(int dlgNumber) {
		  switch (dlgNumber) {

		  case ENDING_ID_0:
			ending_0();
			break;
		  }  
		}
	`)).toBe(true);
});

it('generates player sprite start', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		int playerSpriteStart[] = { ofs_SPR_A, 4, 4 };
	`)).toBe(true);
});

it('should not generate "const" declarations.', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(generatedCode).toEqual(expect.not.stringMatching(/\sconst\s/));
});

it('should not generate "uint8_t" declarations.', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(generatedCode).toEqual(expect.not.stringMatching(/\uint8_t\s/));
});