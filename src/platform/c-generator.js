/**
 * Generates a C constant declaration.
 */
export const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

/**
 * Generates a C array literal from an array
 */
export const toArrayLiteral = elements => `{ ${elements.join(', ')} }`;

/**
 * Generates a flat C array constant from a bidimensional JS array.
 */
export const toMatrixDeclaration = (matrix, transform = v => v, innerIndent = '\n    ') => 
  matrix.map(row => `{ ${row.map(cell => transform(cell)).join(', ')} }`).join(`,${innerIndent}`);

/**
 * Generates a C constant array declaration.
 */
export const toConstantArrayDeclaration = (name, elementType, elements) => toConstantDeclaration(`${name}[]`, elementType, `{
  ${ elements.join(',\n  ') }
}`);
