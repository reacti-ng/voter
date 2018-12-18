import {JsonPointer, jsonPointerToString} from 'json-pointer';

export class JsonParseError extends Error {
  static notAString(actual: any, path?: JsonPointer) {
    return new JsonParseError('a string', actual, path);
  }
  static notANumber(actual: any, path?: JsonPointer) {
    return new JsonParseError('a number', actual, path);
  }
  static notABoolean(actual: any, path?: JsonPointer) {
    return new JsonParseError('a boolean', actual, path);
  }
  static notAJsonPrimitive(actual: any, path?: JsonPointer) {
    return new JsonParseError('a JsonPrimitive', actual, path);
  }
  static notAJsonObject(actual: any, path?: JsonPointer) {
    return new JsonParseError('a JsonObject', actual, path);
  }
  static notAJsonArray(actual: any, path?: JsonPointer) {
    return new JsonParseError('a JsonArray', actual, path);
  }
  static unexpectedNull(pointer?: JsonPointer) {
    return new JsonParseError(`an object decoded with ifNull: 'throw'`, null, pointer);
  }
  constructor(expectType: string, actualInstance: any, pointer?: JsonPointer) {
    const atPointer = pointer && (' at ' + jsonPointerToString(pointer));
    super(`
      Error parsing json object${atPointer}.
      Expected ${expectType}, got ${actualInstance}
      `.replace(/ {6}/g, '').trim()
    );
  }
}
