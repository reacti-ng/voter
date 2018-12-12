import {isBoolean, isNull, isNumber, isString, Mutable} from '../common.types';
import {isDevMode} from '@angular/core';

export class JsonTypeError extends Error {
  constructor(readonly type: string, readonly obj: any) {
    super(`Expected a ${type}, got ${obj}`);
  }
}
export type JsonPrimitive = boolean | number | string;
export function isJsonPrimitive(obj: any): obj is JsonPrimitive {
  return ['string', 'number', 'boolean'].includes(typeof obj);
}
export function notAJsonPrimitiveError(obj: any) {
  return new JsonTypeError('JsonPrimitive', obj);
}

export interface JsonObject { [k: string]: JsonPrimitive | object | any[] | null; }
export function isJsonObject(obj: any): obj is JsonObject {
  return typeof obj === 'object' && obj != null
    // Get rid of this check at production.
    && (isDevMode() ? Object.keys(obj).every((key) => isJsonAny(obj[key])) : true);
}
export function notAJsonObjectError(obj: any) {
  return new JsonTypeError('JsonObject', obj);
}

// Horrible type signature.
export type ObjectDecoderMap<T> = { [K in keyof T]: (value: JsonObject, key?: K) => T[K] };

export const JsonObject = {
  fromJson: <T>(decodeProperties: ObjectDecoderMap<T>, obj: JsonObject) => {
    const tKeys = Object.keys(decodeProperties) as (keyof T)[];
    const t: Mutable<T> = {};

    for (const k of tKeys) {
      t[k] = decodeProperties[k](obj);
    }
    return t as T;
  },
  toJson: <T>(encodeProperties: {[k in keyof T]: (value: T[k], key?: k) => JsonObject}, t: T): JsonObject => {
    const tKeys = Object.keys(t) as (keyof T)[];

    // For each key, call `encodeProperties[key]` with the value `t[key]` and the key itself.
    const partials = tKeys.map((k) => encodeProperties[k](t[k], k));
    return Object.assign({}, ...partials) as JsonObject;
  }
};


export type JsonArray = (JsonPrimitive | JsonObject | any[] | null)[];
export function isJsonArray(obj: any): obj is JsonArray {
  return Array.isArray(obj)
      // Get rid of this check in prod.
      && (isDevMode() ? obj.every(item => isJsonAny(item)) : true);
}
export function notAJsonArrayError(obj: any): JsonTypeError {
  return new JsonTypeError('JsonArray', obj);
}

export const JsonArray = {
  fromJson: <T>(mapper: (value: JsonAny, index?: number) => T, arr: JsonArray) => {
    return arr.map(mapper);
  },
  toJson: <T>(mapper: (value: T, index?: number) => JsonAny, t: T[]) => {
    return t.map(mapper);
  }
};

export type JsonAny = JsonPrimitive | JsonObject | JsonArray | null;
export function isJsonAny(obj: any): obj is JsonAny {
  return isNull(obj) || isJsonPrimitive(obj) || isJsonObject(obj) || isJsonArray(obj);
}
export function notAJsonAnyError(obj: any): Error {
  return new JsonTypeError('JsonAny', obj);
}

interface JsonAnyDecodeParam<T> {
  ifObj?: (obj: JsonObject) => T;
  ifArr?: (obj: JsonArray) => T;
  ifString?: (obj: string) => T;
  ifNum?: (obj: number) => T;
  ifBool?: (obj: boolean) => T;
  ifNull?: () => T;
}

export const JsonAny = {
  fromJson: <T>(decode: JsonAnyDecodeParam<T>, json: JsonAny) => {
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
    throw new JsonTypeError(expected, json);
  }
};

export type JsonDocument = JsonObject | JsonArray;
export function isJsonDocument(obj: any): obj is JsonDocument { return isJsonArray(obj) || isJsonObject(obj); }
export function notAJsonDocumentError(obj: any) {
  return new JsonTypeError('JsonDocument', obj);
}

export const JsonDocument = {
  fromJson: <T>(decode: {ifObj?: (obj: JsonObject) => T, ifArr?: (obj: JsonArray) => T}, json: JsonDocument) => {
    return JsonAny.fromJson(decode, json);
  }
};


