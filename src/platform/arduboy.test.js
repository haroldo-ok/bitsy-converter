import fs from 'promise-fs';

import {convertArduboy} from './arduboy';

it('converts Bitsy script with no error', async () => {
	const source = String(await fs.readFile('./src/example.bitsy'));
	const generatedCode = convertArduboy(source);
	expect(generatedCode).toMatch("Your game's title here");
});
