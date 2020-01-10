import fs from 'promise-fs';

import worldObject from './example.json';

import {convertArduboy, convertWorld} from './arduboy';

const normalizeBlanks = s => s.replace(/\s+/g, ' ').trim();
const containsNormalized = (s1, s2) => normalizeBlanks(s1).includes(normalizeBlanks(s2));

it('converts Bitsy script with no error', async () => {
	const source = String(await fs.readFile('./src/example.bitsy'));
	expect(source).toMatch("Your game's title here");

	const generatedCode = convertArduboy(source);
	expect(generatedCode).toMatch("Your game's title here");
});

it('converts a preparsed Bitsy object with no error', async () => {
	expect(worldObject).toBeTruthy();	
	expect(worldObject).toMatchObject({
		title: "Your game's title here"
	});	
	
	const generatedCode = convertWorld(worldObject);
	expect(generatedCode).toMatch("Your game's title here");
});

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
		const String gameTitle = "Your game's title here";
	`)).toBe(true);
});

it("generates the player start position", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const BitsySprite PROGMEM playerSpriteStart = { ofs_SPR_A, 4, 4 };
	`)).toBe(true);
});

it("generates a dialog function for the first sprite", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		void dialog_SPR_0() {
		  showDialog(F("I'm a cat. Meow!"));  
		}
	`)).toBe(true);
});

it("generates a sprite array for the first room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const BitsySprite PROGMEM room_0_sprites[] = {
		  { ofs_SPR_a, 8, 12, dialog_SPR_0 },
		  { ofs_SPR_b, 10, 6, dialog_SPR_1 }
		};
	`)).toBe(true);
});

it("generates an exit array for the second room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Exit PROGMEM room_1_exits[] = {
		  { 7, 15, 7, 0, 0 },
		  { 0, 11, 14, 11, 2 }
		};
	`)).toBe(true);
});

it("generates an ending array for the third room", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Ending PROGMEM room_2_endings[] = {
		  { 13, 11, ending_0 }
		};
	`)).toBe(true);
});

it("generates an array of rooms", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const Room PROGMEM rooms[] = {

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
		const TileInfo PROGMEM tileInfos[] = {
		  // BLANK
		  { false, 1 },
		  // TIL_a
		  { true, 1 },
		  // TIL_b
		  { false, 2 },
		  { false, 2 },
	`)).toBe(true);
});

it("generates an array of tile image data", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(containsNormalized(generatedCode, `
		const uint8_t PROGMEM images[][8] = { 

		  // BLANK: index 0, offset 0, 1 frame(s)
		  { B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000, B00000000 },
		  // TIL_a: index 1, offset 1, 1 frame(s)
		  { B11111111, B10000001, B10000001, B10011001, B10011001, B10000001, B10000001, B11111111 },
		  // TIL_b: index 2, offset 2, 2 frame(s)
		  { B00000000, B10001000, B10101010, B00100010, B10001000, B10101010, B00100010, B00000000 },
		  { B00000000, B00100010, B10101010, B10001000, B00100010, B10101010, B10001000, B00000000 },
	`)).toBe(true);
});

it("does not generate an invalid character", async () => {
	const generatedCode = convertWorld(worldObject);
	expect(generatedCode).not.toMatch('\x1F');
});
