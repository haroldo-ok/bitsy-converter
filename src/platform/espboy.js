import {flatten, chunk, trimStart} from 'lodash-es';

import {parseWorld} from 'bitsy-parser';

import {prepareWorldInformation} from './world';
import {toConstantDeclaration, toMatrixDeclaration, toConstantArrayDeclaration, toDefinesDeclaration,
       toArrayLiteral, toStringLiteral} from './c-generator';

/**
 * Converts an array of bits into a number
 */
const parseBinary = bits => parseInt(bits.join(''), 2);

/**
 * Converts a number into its hex representation
 */
const toHex = n => n.toString(16).toUpperCase();

/**
 * Converts a byte into its hex representation, with padding.
 */
const toHexByte = n => toHex(n).padStart(2, '0');

/** 
 * Generates a image constant declaration from a bidimensional array. 
 * Assumes the array is 8x8.
 */
const convertTile = (name, tile) =>  {
	const foregroundColor = name.includes('SPR') ? 2 : 1;
	return chunk(flatten(tile), 2).map(pair => `0x${ pair.map(pixel => pixel * foregroundColor ).join('') }`).join(', ');
}

/**
 * Generates image information declaration.
 */
const toImageInfoDeclaration = ({name, frames, isWall}) => `
  // ${name}
  ${ Array(frames.length).fill(`{ ${isWall}, ${frames.length} }`).join(',\n  ') }
`.trim();

/** 
 * Generates a C constant containing all the images contained in imageInfos
 */
const toImageDeclaration = (name, imageInfos) => {
  const infoDeclaration = toConstantDeclaration('tileInfos[]', 'TileInfo', `{
  ${ imageInfos.map(toImageInfoDeclaration).join(',\n  ') }
}`);
	
  const namedImageInfos = flatten(imageInfos.map(({name, frames}) => frames.map((frame, idx) => ({
	  frame, name: `image_${name}_${idx}`
  }))));
	
  const imageDeclarations = namedImageInfos.map(({name, frame}) => `char ${name}[] = { ${convertTile(name, frame)} };`);
  
  const content = namedImageInfos.map(({name}) => `  ${name}`).join(',\n  ');
  
  return `${infoDeclaration}

${imageDeclarations.join('\n')}

int ${name}[] = { 
  ${content} 
};`
}

const generateUnknownDialogCommand = command => `/* Unknown command: ${command.type} name=${command.name} mode=${command.mode} */`;

const generatePrintDialogCommand = command => `showDialog(${toStringLiteral(command.arguments[0].value)});`;

const generateBlockDialogCommand = command => command.children
  .map(child => child.type === 'function'&& child.name === 'print' ? generatePrintDialogCommand(child) : generateUnknownDialogCommand(child)).join('\n  ');

/**
 * Generates a dialog function.
 */
const toDialogDeclaration = (prefix, name, dialog) => {
  const content = dialog.type === 'block' && dialog.mode === 'dialog' ?
    generateBlockDialogCommand(dialog) : generateUnknownDialogCommand(dialog);
  return `void ${prefix}_${name}() {
  ${content}  
}`;
}

/**
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration('dialog', name, dialog)).join('\n\n');

/**
 * Generates dialog functions from the world object
 */
const toEndingsDeclaration = world => Object.entries(world.ending).map(([name, dialog]) => toDialogDeclaration('ending', name, dialog)).join('\n\n');

/**
 * Generates a C constant from a room object.
 */
const toRoomDeclaration = (room) => `
  // Room ${room.id}
  {{
    ${ toMatrixDeclaration(room.tilemap) }
  }, ${room.sprites.length}, room_${room.id}_sprites, ${room.exits.length}, room_${room.id}_exits, ${room.endings.length}, room_${room.id}_endings}
`;

/**
 * Generates a C constant from a sprite object.
 */
const toSpriteDeclaration = sprite => `{ ofs_${sprite.drw}, ${sprite.x}, ${sprite.y}${sprite.dlg ? `, dialog_${sprite.dlg}` : ''} }`;

/**
 * Generates a constant array declaration, or '{{0}}' if empty.
 */
const toConstantArrayDeclarationOrEmpty = (name, elementType, elements) => elements && elements.length ?
  toConstantArrayDeclaration(name, elementType, elements) : 
  toConstantDeclaration(`${name}[]`, elementType, '{{0}}');
      

/**
 * Generates a C constant representing all the rooms contained in a room object.
 */
const toRoomsDeclaration = (name, roomInfos) => {
  const spriteDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_sprites`, 'BitsySprite', room.sprites.map(toSpriteDeclaration)));
  
  const exitDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_exits`, 'Exit', 
    room.exits.map( ({x, y, dest}) => toArrayLiteral([x, y, dest.x, dest.y, dest.room]) )
  ));

  const endingDeclarations = roomInfos.map(room => toConstantArrayDeclarationOrEmpty(
    `room_${room.id}_endings`, 'Ending',
    room.endings.map(({x, y, id}) => toArrayLiteral([x, y, `ending_${id}`]))
  ));

  const roomsDeclaration = toConstantDeclaration(`${name}[]`, 'Room', `{
${ roomInfos.map(room => toRoomDeclaration(room)).join(',') }
}`);

  return [...spriteDeclarations, ...exitDeclarations, ...endingDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object. 
 */
export const convertWorld = world => {
  const {imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart} = prepareWorldInformation(world);
  
  const imageOffsetBody = toDefinesDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`);
  const mainGeneratedBody = [
	  /*
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('gameTitle[]', 'char', toStringLiteral(world.title)),
    toConstantDeclaration('playerSpriteStart', 'BitsySprite', toSpriteDeclaration(playerSpriteStart)),
    toDialogsDeclaration(world),
    toEndingsDeclaration(world),
    toRoomsDeclaration('rooms', roomInfos),
	*/
	  toImageDeclaration('images', imageInfos),
  ].join('\n\n');

  return trimStart(`
${imageOffsetBody}
${mainGeneratedBody}
`);
}

export const convertESPBoy = code => {
  const world = parseWorld(code, {parseScripts: true}); 
  return convertWorld(world);
}