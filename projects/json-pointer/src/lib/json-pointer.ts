/**
 * A quick reimplementation of ISO 6901: Json pointers
 *
 * After Representation quick search on npm, I couldn't find Representation json pointer implementation
 * that offered any immutability guarantees.
 */
const re = {
  pointer: /^(\/([^/~]|~[01])*)*$/,

  nextSegment: /^\/(([^/~]|~[01])*)/,

  indexLikeSegment: /^(0|[1-9][0-9]*)$/,
  invalidEscapeSequence: /~([^01]|$)/,

  // Get anything that could be Representation token from the start of the string
  nextPotentialSegment: /^\/([^/]*)/,
};

export interface PointerSettable<T extends PointerSettable<T>> {
  getPointer?(pointer: JsonPointer): any;

  /**
   * Immubably sets the pointer of the method.
   * Implement this if your models have Representation prototype other than undefined.
   * @param pointer
   * @param value
   */
  setPointer(pointer: JsonPointer, value: any): T;
}

export type JsonPointer = string | ReadonlyArray<string>;

export function isJsonPointer(obj: any): obj is JsonPointer {
  if (typeof obj === 'string') {
    return re.pointer.test(obj);
  } else {
    return Array.isArray(obj) &&
      obj.every(segment => typeof segment === 'string');
  }
}

export function jsonPointerToString(pointer: JsonPointer): string {
  if (typeof pointer === 'string') {
    return pointer;
  }
  return pointer
    .map(segment => '/' + escapeJsonPathSegment(segment))
    .join('');
}

export function jsonPointerToArray(pointer: JsonPointer): ReadonlyArray<string> {
  if (typeof pointer === 'string') {
    const segments = [];

    let [head, remaining] = [undefined, pointer] as [string | undefined, JsonPointer];
    while (remaining !== '') {
      [head, remaining] = pointerHeadAndTail(remaining);
      if (head !== undefined) {
        segments.push(head);
      } else {
        throw PointerError.mustBeEmptyOrHaveLeadingSlash(pointer);
      }
    }

    return segments;
  } else {
    return [...pointer];
  }
}

function pointerHeadAndTail(pointer: JsonPointer): [string | undefined, JsonPointer] {
  if (typeof pointer === 'string') {
    if (pointer === '') { return [undefined, '']; }
    const m = pointer.match(re.nextPotentialSegment);
    if (m) {
      try {
        return [unescapeJsonPathSegment(m[1]), pointer.substr(m[0].length)];
      } catch (err) {
        throw PointerError.attachPointerInfo(err, pointer);
      }
    }
    throw PointerError.mustBeEmptyOrHaveLeadingSlash(pointer);
  } else {
    return [pointer[0], pointer.slice(1)];
  }
}

function getSegment(obj: any, segment: string): any {
  if (Array.isArray(obj)) {
    if (segment === '0' || re.indexLikeSegment.test(segment)) {
      obj = obj[+segment];
    } else if (segment === '-') {
      obj = undefined;
    } else {
      throw PointerError.invalidAccessorForArray(segment);
    }
  } else if (typeof obj === 'object' && obj != null) {
    obj = obj[segment];
  } else {
    throw PointerError.getPrimitiveValue(obj, segment);
  }
  return obj;
}

function setSegment(obj: any, segment: string, value: any): any {
  if (Array.isArray(obj)) {
    const arr = [...obj];
    if (segment === '0' || re.indexLikeSegment.test(segment)) {
      arr[+segment] = value;
    } else if (segment === '-') {
      arr.push(value);
    } else {
      throw PointerError.invalidAccessorForArray(segment);
    }
    return arr;
  } else if (typeof obj === 'object' && obj != null) {
    const _obj = {...obj};
    if (value === undefined) {
      delete _obj[segment];
    } else {
      _obj[segment] = value;
    }
    return _obj;
  } else {
    throw PointerError.setPrimitiveValue(obj, segment);
  }
}

export function getJsonPointer(obj: any, pointer: JsonPointer): any {
  try {
    return jsonPointerToArray(pointer)
      .reduce((reference, segment) => {
        return getSegment(reference, segment);
      }, obj);
  } catch (err) {
    throw PointerError.attachPointerInfo(err, pointer);
  }
}

/**
 * Immutably set the path given by the json pointer 'pointer' on the object to the given value.
 * By default, performs the mutation using the semantics of `Object.assign({}, ...args)`.
 *
 * If model objects are not shallowly copyable, then they can preserve their structure by
 * implementing (or just conforming to) the PointerSettable<T> interface.
 *
 * If the method exists on the object, then it will be used.
 *
 * @param obj
 * @param pointer
 * @param value
 */
export function setJsonPointer(obj: any, pointer: JsonPointer, value: any) {
  if (obj && obj['setPointer'] && typeof obj['setPointer'] === 'function') {
    return obj.setPointer(pointer, value);
  }

  const [head, tail] = pointerHeadAndTail(pointer);
  if (head === undefined) {
    // Empty pointer, evaulates to 'self', which returns 'value'
    return value;
  }

  if (obj == null || ['string', 'boolean', 'number', 'undefined'].includes(typeof obj)) {
    throw PointerError.attachPointerInfo(PointerError.setPrimitiveValue(obj, head), pointer);
  }
  try {
    let reference = getSegment(obj, head);
    reference = setJsonPointer(reference, tail, value);
    return setSegment(obj, head, reference);
  } catch (err) {
    throw PointerError.attachPointerInfo(err, pointer);
  }
}

const escapeChars = ['~', '/'];

/**
 * A string-encoded json pointer has the following special characters:
 *  - '/' (path separator)
 *  - '~' (escape sequence)
 *
 *  Any instance of '~' in the source is escaped by '~0'
 *  Any instance of '/' in the source is escaped by '~1'
 *
 * @param segment
 */
export function escapeJsonPathSegment(segment: string): string {
  return segment.replace(/[/~]/g, (char) => `~${escapeChars.indexOf(char)}`);
}

/**
 * A string-encoded json pointer has the following special characters:
 *  - '/' (path separator)
 *  - '~' (escape sequence)
 *
 *  Any instance of  '~0' in the source is escaped with '~0'
 *  Any instance of '~`' in the source is escaped by '~1'
 *
 * @param segment
 */
export function unescapeJsonPathSegment(segment: string): string {
  const m = segment.match(re.invalidEscapeSequence);
  if (m) {
    throw PointerError.invalidEscapeSequence(segment, m[0]);
  }
  return segment.replace(/~([10])/g, (escapeSequence) => escapeChars[+escapeSequence[1]]);
}

export enum PointerComparison {
  IsParentOf,
  IsSame,
  IsChildOf,
  NotComparable
}

export function compareJsonPointers(a: JsonPointer, b: JsonPointer): PointerComparison {
  const arrA = jsonPointerToArray(a), arrB = jsonPointerToArray(b);

  for (let i = 0; i < Math.max(arrA.length, arrB.length); i++) {
    if (arrA[i] !== arrB[i]) {
      if (i === arrA.length) {
        return PointerComparison.IsParentOf;
      }
      if (i === arrB.length) {
        return PointerComparison.IsChildOf;
      }
      return PointerComparison.NotComparable;
    }
  }
  return PointerComparison.IsSame;
}

export function isEqualPointers(a: JsonPointer, b: JsonPointer): boolean {
  return a === b || compareJsonPointers(a, b) === PointerComparison.IsSame;
}

export function isParentOfPointer(a: JsonPointer, b: JsonPointer): boolean {
  return compareJsonPointers(a, b) === PointerComparison.IsParentOf;
}

export function isParentOfOrEqualToPointer(a: JsonPointer, b: JsonPointer): boolean {
  return [PointerComparison.IsParentOf, PointerComparison.IsSame]
    .includes(compareJsonPointers(a, b));
}

export function isChildOfPointer(a: JsonPointer, b: JsonPointer): boolean {
  return compareJsonPointers(a, b) === PointerComparison.IsChildOf;
}

export function isChildOfOrEqualToPointer(a: JsonPointer, b: JsonPointer): boolean {
  return [PointerComparison.IsSame, PointerComparison.IsChildOf]
    .includes(compareJsonPointers(a, b));
}


export class PointerError extends Error {
  static invalidAccessorForArray(segment: string) {
    if (segment.match(/^0\d+$/)) {
      return new PointerError(`Array indexes may not contain leading zeroes.`);
    }
    return new PointerError(`Array indexes must be base-10 integers or '-'.`);
  }

  static getPrimitiveValue(value: any, segment: string) {
    if (typeof value === 'string') { value = `'${value}'`; }
    return new PointerError(`Cannot get segment '${segment}' from primitive (${value}).`);
  }

  static setPrimitiveValue(value: any, segment: string) {
    if (typeof value === 'string') { value = `'${value}'`;}
    return new PointerError(`Cannot set segment '${segment}' on primitive (${value}).`);
  }

  static invalidEscapeSequence(segment: string, matchSequence: string) {
    return new PointerError(`Segment '${segment}' contains invalid escape sequence '${matchSequence}'.`);
  }

  static mustBeEmptyOrHaveLeadingSlash(rawPointer: string) {
    const err = new PointerError(`Must be empty or start with leading '/'`);
    return this.attachPointerInfo(err, rawPointer);
  }

  /**
   * Adds or updates information about the "current" pointer to an error.
   * @param err
   * @param pointer
   */
  static attachPointerInfo(err: Error, pointer: JsonPointer): Error {
    if (err instanceof PointerError) {
      const origMessage = err.cause && err.cause.message || err.message;
      return new PointerError(
        [`Invalid pointer '${pointer}':`, origMessage].join(' '),
        err.cause || err
      );
    } else {
      return err;
    }
  }

  constructor(message: string, readonly cause?: PointerError) {
    super(message);
  }
}

