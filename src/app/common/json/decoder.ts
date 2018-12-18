import {JsonPointer} from 'json-pointer';
import {isJsonArray, isJsonObject, JsonAny, JsonArray, JsonObject, ObjectDecoderMap} from './json.model';
import {isBoolean, isNull, isNumber, isString, Mutable} from '../common.types';

export type JsonParser<Json extends JsonAny, T> = (obj: Json, pointer?: JsonPointer) => T;

interface FromNull<T>       { 'null'  ?: () => T;                     }
interface FromBoolean<T>    { boolean ?: JsonParser<string, T>;    }
interface FromString<T>     { string  ?: JsonParser<string, T>;     }
interface FromNumber<T>     { number  ?: JsonParser<number, T>;     }

interface FromObject<T>     { object  ?: JsonParser<JsonObject, T>; }
interface FromArray<T>      { array   ?:  JsonParser<JsonObject, T>; }

type FromDocument<T>  = FromObject<T> | FromArray<T>;
type FromPrimitive<T> = FromBoolean<T> | FromString<T> | FromNumber<T>;

type FromAny<T> = FromPrimitive<T> | FromDocument<T>;

type FromNullableBoolean<T>   = FromBoolean<T> & FromNull<T>;
type FromNullableString<T>    = FromString<T> & FromNull<T>;
type FromNullableNumber<T>    = FromNumber<T> & FromNull<T>;
type FromNullableObject<T>    = FromObject<T> & FromNull<T>;
type FromNullableArray<T>     = FromArray<T> & FromNull<T>;

type FromNullablePrimitive<T> = FromPrimitive<T> & FromNull<T>;
type FromNullableAny<T>       = FromAny<T> & FromNull<T>;

export function fromObjectProperties<T>(properties: {[K in keyof T]: JsonParser<JsonObject, T[K]>}) {
  return function (obj: JsonObject) {
    const tKeys = Object.keys(properties) as (keyof T)[];
    const t: Mutable<T> = {};

    for (const k of tKeys) {
      t[k] = properties[k](obj);
    }
    return t as T;
  };
}
/*
  toJson: <T>(encodeProperties: {[k in keyof T]: (value: T[k], key?: k) => JsonObject}, t: T): JsonObject => {
    const tKeys = Object.keys(t) as (keyof T)[];

    // For each key, call `encodeProperties[key]` with the value `t[key]` and the key itself.
 const partials = tKeys.map((k) => encodeProperties[k](t[k], k));
  return Object.assign({}, ...partials) as JsonObject;
}
*/


export function fromJsonAny<T>(fromJson: FromAny<T>): JsonParser<JsonAny, T> {
  if (decode.ifObj && isJsonObject(json)) {
    return decode.ifObj(json);
  }
  if (decode.ifArr && isJsonArray(json)) {
    return decode.ifArr(json);
  }
  if (decode.ifString && isString(json)) {
    return decode.ifString(json);
  }
  if (decode.ifNum && isNumber(json)) {
    return decode.ifNum(json);
  }
  if (decode.ifBool && isBoolean(json)) {
    return decode.ifBool(json);
  }
  if (decode.ifNull && isNull(json)) {
    return decode.ifNull();
  }

  if (Object.keys(decode).length === 0) {
    throw new Error('At most one type decoder must be provided to JsonAny.fromJson');
  }
  const expected = [
    decode.ifObj ? 'JsonObject' : '',
    decode.ifArr ? 'JsonArray' : '',
    decode.ifString ? 'string' : '',
    decode.ifNum ? 'number' : '',
    decode.ifBool ? 'boolean' : ''
  ].join(' | ');
  throw new JsonParseError(expected, json);
}
};

