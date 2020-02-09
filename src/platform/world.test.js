import fs from 'promise-fs';

import { prepareForCaseInsensitive } from './world';

import worldObject from './example.json';

describe('handle case-insensitivity', () => {	

	it('does not contain, on the "images" object, keys that would cause collision', async () => {
		const processedWorld = prepareForCaseInsensitive(worldObject);
		expect(Object.keys(processedWorld.images)).toEqual(expect.not.arrayContaining(['SPR_a']));
	});
	
	it('renames the keys, on the "images" object, that would cause collision', async () => {
		const processedWorld = prepareForCaseInsensitive(worldObject);
		expect(Object.keys(processedWorld.images)).toEqual(expect.arrayContaining(['SPR_a_1']));
	});

	it('references to images on the "sprite" object should be renamed accordingly', async () => {
		const processedWorld = prepareForCaseInsensitive(worldObject);
		expect(processedWorld.sprite.a.drw).toEqual('SPR_a_1');
	});

	it('references to images on the "tile" object should be renamed accordingly', async () => {
		const processedWorld = prepareForCaseInsensitive(worldObject);
		expect(processedWorld.tile.a.drw).toEqual('TIL_a');
	});

});