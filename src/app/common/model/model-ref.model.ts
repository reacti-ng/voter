import {JsonPointer} from 'json-pointer';

import {isString} from '../common.types';
import {isJsonObject, JsonAny, JsonObject} from '../json/json.model';
import {Ident} from './ident.model';
import {JsonParseError} from '../json/parse-errors';
import {Default, JsonDecoder} from '../json/decoder';
import {JsonEncoder} from '../json/encoder';

export type ModelRef<T extends Ident> = string | T;
export function isModelRef<T extends Ident>(obj: any): obj is ModelRef<T> {
  return typeof obj === 'string' || isJsonObject(obj);
}
export function isJsonModelRef(obj: JsonAny): obj is string | JsonObject {
  return isString(obj) || isJsonObject(obj);
}

export function modelRefFromJson<T extends Ident>(decodeObject: JsonDecoder<JsonObject, T>): JsonDecoder<JsonAny, ModelRef<T>> {
  return function (json: JsonAny, pointer?: JsonPointer) {
    if (isString(json)) {
      return json as string;
    }
    if (isJsonObject(json) && typeof json.id === 'string') {
      return decodeObject(json, pointer);
    }
    throw new JsonParseError('JsonObject | string', json);
  };
}
export function modelRefToJson<T extends Ident>(): JsonEncoder<ModelRef<T>, string> {
  return function (ref) { return isString(ref) ? ref : ref.id; };
}

export function modelRefProperty<T extends Ident>(decodeObj: JsonDecoder<JsonObject, T>) {
  const _decode = modelRefFromJson(decodeObj);
  return {
    object: _decode,
    string: _decode,
  };
}

