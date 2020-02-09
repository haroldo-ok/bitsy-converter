import {groupBy, fromPairs} from 'lodash-es';

/**
 * Generates an object containing various information about the images contained in the world object.
 */
const extractImageInfos = world => {
  const withBlank = [ ['BLANK', [ Array(8).fill(Array(8).fill(0)) ] ], ...Object.entries(world.images) ];
  const imageInfos = withBlank.map(([name, frames], index) => ({ name, frames, index }));
  
  const tilesByDrw = fromPairs(Object.values(world.tile).map(tile => [tile.drw, tile]));
  const withWalls = imageInfos.map(info => ({
    ...info, 
    isWall: !!(tilesByDrw[info.name] && tilesByDrw[info.name].isWall)
  }));
  
  const withOffsets = withWalls.reduce(({offset, results}, info) => ({
    offset: offset + info.frames.length,
    results: [...results, {offset, ...info}]
  }), {offset: 0, results: []}).results;  
  
  return withOffsets;
}

/**
 * Checks if a given sprite is from the player.
 */
const isPlayerSprite = (sprite, world) => sprite.id === world.playerId;

/**
 * Returns a list containing the sprites that aren't from the player.
 */
const listNonPlayerSprites = (sprites, world) => (sprites || []).filter(sprite => !isPlayerSprite(sprite, world));

/**
 * Given the value contained in a map cell, returns the corresponding image offset.
 */
const imageOffsetForMapCell = (cell, world, imageOffsets) => cell === '0' ? 0 : imageOffsets[world.tile[cell].drw];

/**
 * Produces a matrix of image offsets from a matrix of cell values.
 */
const convertRoomMapToOffsets = (tilemap, world, imageOffsets) => tilemap.map(row => row.map(v => imageOffsetForMapCell(v, world, imageOffsets)));

/**
 * Generates an array containing information about the rooms contained in the world object.
 */
const extractRoomInfos = (world, imageOffsets) => {
  const spritesPerRoom = groupBy(Object.values(world.sprite), 'room');
  return Object.values(world.room).map(room => ({
    ...room,
    sprites: listNonPlayerSprites(spritesPerRoom[room.id], world),
    tilemap: convertRoomMapToOffsets(room.tilemap, world, imageOffsets),
  }));
};

/**
 * Returns an object that tells how the keys of another object must be renamed to avoid collision on case-insensitive languages.
 */
const generateCaseInsensitiveRenameMap = (object) => {
  const originalKeys = Object.keys(object);
  
  const lowerToKey = originalKeys.reduce((o, key) => {
    const lower = key.toLowerCase();
    if (!(lower in o)) {
      o[lower] = key;
    }
    return o;
  }, {});
  
  const translatedKeys = originalKeys.reduce((o, key) => {    
    const lower = key.toLowerCase();
    if (lowerToKey[lower] === key) {
      // It wasn't colliding
      o[key] = key;
    } else {
      // It was colliding; rename it.
      let n = 0;
      let candidate = null;
      do {
        n++;
        candidate = lower + '_' + n;
      } while (o[candidate]);
      
      lowerToKey[candidate] = key;
      o[key] = key + '_' + n;
    }
    return o;
  }, {});
  
  return translatedKeys;
}

const renameObjectKeys = (object, keyMap) => fromPairs(Object.entries(object).map(([k, v]) => [keyMap[k], v]));

/**
 * Changes the name of a few things in the world object so they won't cause trouble when generating code for a case-insentitive language.
 */
export const prepareForCaseInsensitive = world => {
  const renamesForImages = generateCaseInsensitiveRenameMap(world.images);
  const images = renameObjectKeys(world.images, renamesForImages);
  
  const sprite = fromPairs(Object.entries(world.sprite).map(([k, v]) => [k, { ...v, drw: renamesForImages[v.drw] }]));
  const tile = fromPairs(Object.entries(world.tile).map(([k, v]) => [k, { ...v, drw: renamesForImages[v.drw] }]));
  
  return { ...world, tile, sprite, images };
}

/**
 * Takes the world object, and extracts extra information from it.
 */
export const prepareWorldInformation = world => {
  const imageInfos = extractImageInfos(world);
  
  const imageOffsets = fromPairs(imageInfos.map(({name, offset}) => [name, offset]));
  const frameCount = imageInfos.reduce((total, info) => total + info.frames.length, 0);
  
  const roomInfos = extractRoomInfos(world, imageOffsets);
  const playerSpriteStart = Object.values(world.sprite).find(sprite => isPlayerSprite(sprite, world));
  
  return {world, imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart};
};
