import fs from 'promise-fs';

import worldObject from './example.json';

import {convertWorld} from './libcv';

const normalizeBlanks = s => s.replace(/\s+/g, ' ').trim();
const containsNormalized = (s1, s2) => normalizeBlanks(s1).includes(normalizeBlanks(s2));

it('generates image offsets correctly', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		enum ImageOffset {
		  ofs_BLANK = 0,
		  ofs_TIL_a = 1,
		  ofs_TIL_b = 2,
		  ofs_TIL_c = 4,
		  ofs_TIL_d = 5,
		  ofs_SPR_A = 6,
		  ofs_SPR_a = 8,
		  ofs_SPR_b = 10,
		  ofs_ITM_0 = 11
		};
	`)).toBe(true);
});

it("generates a constant for the game's title", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const char gameTitle[] = "Your game's title here";
	`)).toBe(true);
});

it("generates the player start position", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const BitsySprite playerSpriteStart = { ofs_SPR_A, 4, 4 };
	`)).toBe(true);
});

it("generates a dialog function for the first sprite", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void dialog_SPR_0() {
		  showDialog("I'm a cat. Meow!");  
		}
	`)).toBe(true);
});

it("generates a sprite array for the first room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const BitsySprite room_0_sprites[] = {
		  { ofs_SPR_a, 8, 12, dialog_SPR_0 },
		  { ofs_SPR_b, 10, 6, dialog_SPR_1 }
		};
	`)).toBe(true);
});

it("generates an empty sprite array for the second room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const BitsySprite room_1_sprites[] = {{0}};
	`)).toBe(true);
});

it("generates an exit array for the second room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Exit room_1_exits[] = {
		  { 7, 15, 7, 0, 0 },
		  { 0, 11, 14, 11, 2 }
		};
	`)).toBe(true);
});

it("generates an empty exit array for the third room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Exit room_2_exits[] = {{0}};
	`)).toBe(true);
});

it("generates an empty ending array for the first room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Ending room_1_endings[] = {{0}};
	`)).toBe(true);
});

it("generates a populated ending array for the third room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Ending room_2_endings[] = {
		  { 13, 11, ending_0 }
		};
	`)).toBe(true);
});

it("generates an array of rooms", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Room rooms[] = {

		  // Room 0
		  {{
			{ 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0 },
			{ 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0 },
			{ 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
			{ 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0 },
			{ 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
			{ 0, 1, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 1, 0 },
			{ 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0 },
			{ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 }
		  }, 2, room_0_sprites, 1, room_0_exits, 0, room_0_endings}
	`)).toBe(true);
});

it("generates an array of tile information", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const TileInfo tileInfos[] = {
		  // BLANK
		  { false, 1 },
		  // TIL_a
		  { true, 1 },
		  // TIL_b
		  { false, 2 },
		  { false, 2 },
		  // TIL_c
		  { false, 1 },
		  // TIL_d
		  { false, 1 },
		  // SPR_A
		  { false, 2 },
		  { false, 2 },
		  // SPR_a
		  { false, 2 },
		  { false, 2 },
		  // SPR_b
		  { false, 1 },
		  // ITM_0
		  { false, 1 }
		};
	`)).toBe(true);
});

it("generates an array of tile image data", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const uint8_t images[][8] = { 

		  // BLANK: index 0, offset 0, 1 frame(s)
		  { 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 },
		  // TIL_a: index 1, offset 1, 1 frame(s)
		  { 0xFF, 0x81, 0x81, 0x99, 0x99, 0x81, 0x81, 0xFF },
		  // TIL_b: index 2, offset 2, 2 frame(s)
		  { 0x00, 0x36, 0x00, 0x6C, 0x00, 0x36, 0x00, 0x6C },
		  { 0x00, 0x6C, 0x00, 0x36, 0x00, 0x6C, 0x00, 0x36 },
		  // TIL_c: index 3, offset 4, 1 frame(s)
		  { 0x3E, 0x42, 0x81, 0x82, 0x81, 0x82, 0x41, 0x3E },
		  // TIL_d: index 4, offset 5, 1 frame(s)
		  { 0x00, 0x00, 0xC1, 0x81, 0xD1, 0x9B, 0xDB, 0x00 },
		  // SPR_A: index 5, offset 6, 2 frame(s)
		  { 0x18, 0x18, 0x18, 0x3C, 0x7E, 0xBD, 0x24, 0x20 },
		  { 0x18, 0x18, 0x99, 0x7E, 0x3C, 0x3C, 0x24, 0x04 },
		  // SPR_a: index 6, offset 8, 2 frame(s)
		  { 0x00, 0x00, 0x51, 0x71, 0x72, 0x7C, 0x3C, 0x24 },
		  { 0x00, 0x50, 0x71, 0x71, 0x72, 0x3C, 0x3C, 0x42 },
		  // SPR_b: index 7, offset 10, 1 frame(s)
		  { 0x01, 0x01, 0x01, 0x01, 0xFF, 0x81, 0x81, 0x81 },
		  // ITM_0: index 8, offset 11, 1 frame(s)
		  { 0x00, 0x00, 0x00, 0x3C, 0x64, 0x24, 0x18, 0x00 }
		};
	`)).toBe(true);
});
