/**
 * Generates a C constant declaration.
 */
export const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

/**
 * Generates a C array declaration from an array
 */
export const toArrayDeclaration = elements => `{ ${elements.join(', ')} }`;

/**
 * Generates a flat C array constant from a bidimensional JS array.
 */
export const toMatrixDeclaration = (matrix, transform = v => v, innerIndent = '\n    ') => 
  matrix.map(row => `{ ${row.map(cell => transform(cell)).join(', ')} }`).join(`,${innerIndent}`);
