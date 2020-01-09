import fs from 'promise-fs';

import worldObject from './example.json';

import {convertArduboy, convertWorld} from './arduboy';

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
