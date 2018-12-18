import {JsonPointer, jsonPointerToArray} from 'json-pointer';

export function joinJsonPointer(...pointers: JsonPointer[]) {
  return pointers.reduce((a, b) => [...a, ...b], []);

}
