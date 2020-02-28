import {flatten, chunk, trimStart} from 'lodash-es';

import {parseWorld} from 'bitsy-parser';

import {prepareWorldInformation, prepareForCaseInsensitive} from './world';
import {toConstantDeclaration, toMatrixDeclaration, toConstantArrayDeclaration, toDefineDeclaration, toDefinesDeclaration,
       toInitializedDeclaration, toInitializedArrayDeclaration, toArrayLiteral, toStringLiteral} from './c-generator';

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
  ${ Array(frames.length).fill(`${isWall}, ${frames.length}`).join(',\n  ') }
`.trim();

/** 
 * Generates a C constant containing all the images contained in imageInfos
 */
const toImageDeclaration = (name, imageInfos) => {
  const infoDeclaration = toInitializedDeclaration('tileInfos[]', 'char', `{
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
 * Generates dialog ID constants from the world object
 */
const toDialogIdConstantsDeclaration = world => Object.keys(world.dialog).map((name, idx) => toDefineDeclaration(`DIALOG_ID_${name}`, idx + 1)).join('\n');

/**
 * Generates dialog functions from the world object
 */
const toDialogsDeclaration = world => Object.entries(world.dialog).map(([name, dialog]) => toDialogDeclaration('dialog', name, dialog)).join('\n\n');

/**
 * Generates ending ID constants from the world object
 */
const toEndingIdConstantsDeclaration = world => Object.keys(world.ending).map((name, idx) => toDefineDeclaration(`ENDING_ID_${name}`, idx + 1)).join('\n');

/**
 * Generates ending functions from the world object
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

const toSpriteInternalDeclaration = sprite => `  ofs_${sprite.drw}, ${sprite.x}, ${sprite.y}, ${sprite.dlg ? `dialog_${sprite.dlg}` : '0'}`;

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
  const spriteDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_sprites`, 'int', room.sprites.map(toSpriteInternalDeclaration)));
  
  const exitDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_exits`, 'char', 
    room.exits.map( ({x, y, dest}) => [x, y, dest.x, dest.y, dest.room].join(', ') )
  ));

  const endingDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}_endings`, 'char',
    room.endings.map(({x, y, id}) => [x, y, `ENDING_ID_${id}`].join(', ') )
  ));

  const roomMapDeclarations = roomInfos.map(room => toInitializedArrayDeclaration(
    `room_${room.id}`, 'char',
    room.tilemap.map(row => row.join(', ') )
  ));

  const roomsDeclaration = toInitializedArrayDeclaration(
    'rooms', 'int',
    roomInfos.map(room => `room_${room.id}, ${room.sprites.length}, room_${room.id}_sprites, ${room.exits.length}, room_${room.id}_exits, ${room.endings.length}, room_${room.id}_endings`)
  );

  return [...spriteDeclarations, ...exitDeclarations, ...endingDeclarations, ...roomMapDeclarations, roomsDeclaration].join('\n\n');
}

/**
 * Generates Arduboy-compatible C++ code from a Bitsy script object. 
 */
export const convertWorld = world => {
  const caseInsensitiveWorld = prepareForCaseInsensitive(world);
  const {imageInfos, imageOffsets, frameCount,roomInfos, playerSpriteStart} = prepareWorldInformation(caseInsensitiveWorld);
  
  const definesBody = [
	  toDefinesDeclaration('ImageOffset', imageOffsets, k => `ofs_${k}`),
	  toDialogIdConstantsDeclaration(caseInsensitiveWorld),
	  toEndingIdConstantsDeclaration(caseInsensitiveWorld)
  ].join('\n\n');
	
  const mainGeneratedBody = [
    toConstantDeclaration('FRAME_COUNT', 'uint8_t', frameCount),
    toConstantDeclaration('gameTitle[]', 'char', toStringLiteral(world.title)),
	  /*
    toConstantDeclaration('playerSpriteStart', 'BitsySprite', toSpriteDeclaration(playerSpriteStart)),
	*/
    toRoomsDeclaration('rooms', roomInfos),
  	toImageDeclaration('images', imageInfos),
  ].join('\n\n');
	
  const dialogFunctionsBody = [
    toDialogsDeclaration(world),
    toEndingsDeclaration(world),
  ];	 

  return trimStart(`
${definesBody}
${mainGeneratedBody}
${dialogFunctionsBody}
`);
}

export const convertESPBoy = code => {
  const world = parseWorld(code, {parseScripts: true}); 
  return convertWorld(world);
}
