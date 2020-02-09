
/**
 * Generates a C array literal from an array
 */
export const toArrayLiteral = elements => `{ ${elements.join(', ')} }`;

/**
 * Generates a C string literal from a string
 */
export const toStringLiteral = text => `"${text}"`;


/**
 * Generates a C constant declaration.
 */
export const toConstantDeclaration = (name, type, value) => `const ${type} ${name} = ${value};`;

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

/**
 * Generates a C enum declaration from a JS object.
 */
export const toEnumDeclaration = (name, object, keyFunction = k => k) =>`
enum ${name} {
${ Object.entries(object).map(([k, i]) => `  ${keyFunction(k)} = ${i}`).join(',\n') }
};`

/**
 * Generates a simple `#define` declaration from a name and a value.
 */
export const toDefineDeclaration = (name, value) => `#define ${name} ${value}`;

/**
 * Generates a sequence of C defines from the keys and values of a JS object
 */
export const toDefinesDeclaration = (name, object, keyFunction = k => k) =>
  Object.entries(object).map(([k, i]) => toDefineDeclaration(keyFunction(k), i)).join('\n');
