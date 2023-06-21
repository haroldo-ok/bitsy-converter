import fs from 'promise-fs';

import worldObject from './issue-15.json';

import {convertWorld} from '../libcv';

it('converts welcome_to_enduro_death_race_tur.bitsy without errors', async () => {
	const generatedCode = convertWorld(worldObject);
	expect(generatedCode).toBeTruthy();
});
