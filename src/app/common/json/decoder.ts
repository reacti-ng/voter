/* tslint:disable: unified-signatures max-line-length */

import {JsonPointer, jsonPointerToArray} from 'json-pointer';
import {isJsonArray, isJsonObject, JsonAny, JsonArray, JsonObject} from './json.model';
import {isBoolean, isNumber, isString, Mutable} from '../common.types';
import {JsonParseError} from './parse-errors';
import {joinJsonPointers} from './pointer-utils';

export type JsonDecoder<Json, T> = (obj: Json, pointer?: JsonPointer) => T;



export type Default<T> = T | (() => T);

export interface FromAny<T> {
  readonly ifNull?: Default<T> | 'throw' | null;
  readonly boolean?: JsonDecoder<boolean, T> | true;
  readonly string?: JsonDecoder<string, T> | true;
  readonly number?: JsonDecoder<number, T> | true;

  readonly object?: JsonDecoder<JsonObject, T>;
  readonly array?: JsonDecoder<JsonArray, T>;
}


export function fromJsonAny<T>(_if: {string?: true, ifNull?: null}                                       , pointer?: JsonPointer): JsonDecoder<JsonAny, string | null>;
export function fromJsonAny<T>(_if: {string?: true, ifNull?: Default<T> | 'throw' }                      , pointer?: JsonPointer): JsonDecoder<JsonAny, string>;

export function fromJsonAny<T>(_if: {string?: (raw: string) => T, ifNull?: null}                         , pointer?: JsonPointer): JsonDecoder<JsonAny, T | null>;
export function fromJsonAny<T>(_if: {string?: (raw: string) => T, ifNull?: Default<T> | 'throw'}         , pointer?: JsonPointer): JsonDecoder<JsonAny, T>;

export function fromJsonAny<T>(_if: {number?: true, ifNull?: null}                                       , pointer?: JsonPointer): JsonDecoder<JsonAny, number | null>;
export function fromJsonAny<T>(_if: {number?: true, ifNull?: Default<T> | 'throw' }                      , pointer?: JsonPointer): JsonDecoder<JsonAny, number>;

export function fromJsonAny<T>(_if: {boolean?: true, ifNull?: null}                                      , pointer?: JsonPointer): JsonDecoder<JsonAny, boolean | null>;
export function fromJsonAny<T>(_if: {boolean?: true, ifNull?: Default<T> | 'throw' }                     , pointer?: JsonPointer): JsonDecoder<JsonAny, boolean>;

export function fromJsonAny<T>(_if: {object?: JsonDecoder<JsonObject, T>, ifNull?: null}                 , pointer?: JsonPointer): JsonDecoder<JsonAny, T | null>;
export function fromJsonAny<T>(_if: {object?: JsonDecoder<JsonObject, T>, ifNull?: Default<T> | 'throw'} , pointer?: JsonPointer): JsonDecoder<any, T>;

export function fromJsonAny<T>(_if: {array?: JsonDecoder<JsonArray, T>, ifNull?: null}                   , pointer?: JsonPointer): JsonDecoder<JsonAny, T | null>;
export function fromJsonAny<T>(_if: {array?: JsonDecoder<JsonArray, T>, ifNull?: Default<T> | 'throw'}   , pointer?: JsonPointer): JsonDecoder<JsonAny, T>;

export function fromJsonAny<T>(_if: FromAny<T>): JsonDecoder<JsonAny, T>;
export function fromJsonAny<T>(_if: FromAny<T | null>): JsonDecoder<JsonAny, T | null> {
  return function (json: JsonAny , pointer?: JsonPointer) {
    if (json == null) {
      return decodeNullable(_if)(json, pointer);
    }
    if (_if.object && isJsonObject(json)) {
      return useDecoder(_if.object);
    }
    if (_if.array && isJsonArray(json)) {
      return useDecoder(_if.array);
    }
    if (_if.string && isString(json)) {
      return useDecoder(_if.string);
    }
    if (_if.number && isNumber(json)) {
      return useDecoder(_if.number);
    }
    if (_if.boolean && isBoolean(json)) {
      return useDecoder(_if.boolean);
    }

    if (Object.keys(_if).length === 0) {
      throw new Error('At most one type decoder must be provided to JsonAny.fromJson');
    }
    const expected = [
      _if.object ? 'JsonObject' : '',
      _if.array ? 'JsonArray' : '',
      _if.string ? 'string' : '',
      _if.number ? 'number' : '',
      _if.boolean ? 'boolean' : '',
      _if.ifNull ? 'null' : ''
    ].filter(expect => expect !== '').join(' | ');
    throw new JsonParseError(expected, json, pointer);

    function useDecoder(decoder: JsonDecoder<any, T | null> | true) {
      return decoder === true ? json as unknown as T : decoder(json, pointer);
    }
  };
}

export function decodeNullable<T>(_if?: {ifNull?: Default<T> | 'throw' | null}): JsonDecoder<null, T | null> {
  const ifNull = _if && _if.ifNull;

  return function (json: null, pointer?: JsonPointer) {
    if (ifNull == null) {
      return null;
    }
    if (ifNull === 'throw') {
      throw JsonParseError.unexpectedNull(pointer);
    }
    return ((typeof ifNull === 'function') ? (ifNull as () => T)() : ifNull) as T;
  };
}

export function fromJsonArray<Item>(decodeItem: JsonDecoder<JsonAny, Item>): JsonDecoder<JsonArray, Item[]> {
  return function (json: JsonArray, pointer?: JsonPointer) {
    return json.map((item, i) => {
      const pointer_i = joinJsonPointers(pointer || '', `/${i}`);
      return decodeItem(item, pointer_i);
    });
  };
}

function _fromJsonObject<T>(properties: {[K in keyof T]: JsonDecoder<JsonObject, T[K]>}) {
  return function (obj: JsonObject, pointer: JsonPointer = []) {
    const tKeys = Object.keys(properties) as (keyof T)[];
    const t: Mutable<T> = {};

    for (const k of tKeys) {
      const pointer_k = [...jsonPointerToArray(pointer), k.toString()];
      t[k] = properties[k](obj, pointer_k);
    }
    return t as T;
  };
}

export type ObjectProperty<T> = FromAny<T> & {
  readonly source?: string;
  readonly value?: T;
};

/**
 * Decode an object using the metadata associated with each of the serializable properties.
 * @param properties: {[K in keyof T]: ObjectProperty<T[K]>}
 * @param pointer: JsonPointer
 * A pointer tracking which key we are attempting to decode, from the root of the object.
 * If not provided, it is assumed that we are parsing the root of the json object graph.
 */
export function fromJsonObject<T>(properties: {[K in Extract<keyof T, string>]: ObjectProperty<T[K]>}) {
  return function (json: JsonObject, pointer?: JsonPointer) {
    const t: Mutable<T> = {};
    const keys = Object.keys(properties) as (keyof T)[];

    for (const key of keys) {
      if (typeof key === 'string') {
        const tKey = key as Extract<keyof T, string>;
        const pointer_k = joinJsonPointers(pointer || '', `/${tKey}`);
        const decoder = propFromJson(tKey, properties[tKey]);
        t[tKey] = decoder(json, pointer_k);
      } else {
        throw new Error('Properties must have only string keys');
      }
    }
    return t as T;
  };
}

function propFromJson<T, K extends Extract<keyof T, string>>(key: K, prop: ObjectProperty<T[K]>): JsonDecoder<JsonObject, T[K]> {
  const source = prop.source || key;

  if (prop.value !== undefined) {
    return () => prop.value as T[K];
  }

  return function (obj: JsonObject, pointer?: JsonPointer): T[K] {
    const jsonValue = obj[source as string];
    if (jsonValue == null) {
      return decodeNullable({ifNull: prop.ifNull})(null, pointer) as any as T[K];
    }
    return fromJsonAny<T[K]>(prop)(jsonValue, pointer);
  };
}

