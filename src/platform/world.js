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
 * Generates an array containing information about the rooms contained in the world object.
 */
const extractRoomInfos = (world, imageOffsets) => {
  const spritesPerRoom = groupBy(Object.values(world.sprite), 'room');
  return Object.values(world.room).map(room => ({
    ...room,
    sprites: (spritesPerRoom[room.id] || []).filter(sprite => !isPlayerSprite(sprite, world)),
    tilemap: room.tilemap.map(row => row.map(v => v === '0' ? 0 : imageOffsets[world.tile[v].drw]))
  }));
};

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
