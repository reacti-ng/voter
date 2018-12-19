import {JsonPointer, jsonPointerToArray} from 'json-pointer';

export function joinJsonPointers(...pointers: JsonPointer[]) {
  return pointers
    .map(pointer => jsonPointerToArray(pointer))
    .reduce((a, b) => [...a, ...b], []);
}
